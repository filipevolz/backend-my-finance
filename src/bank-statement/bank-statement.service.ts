import { Injectable, BadRequestException } from '@nestjs/common';
import { ExpensesService } from '../expenses/expenses.service';
import { IncomesService } from '../incomes/incomes.service';

interface PdfParseInstance {
  getText(): Promise<{ text: string }>;
  destroy(): Promise<void>;
}
interface PdfParseModule {
  PDFParse: new (opts: { data: Buffer }) => PdfParseInstance;
}
const { PDFParse } = require('pdf-parse') as PdfParseModule;

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_EXTRACTED_TEXT_LENGTH = 50;

interface ParsedEntry {
  date: string; // YYYY-MM-DD
  description: string;
  value: number; // em reais, negativo = saída
}

@Injectable()
export class BankStatementService {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly incomesService: IncomesService,
  ) {}

  async importFromPdf(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{
    expensesCreated: number;
    incomesCreated: number;
    errors: string[];
  }> {
    if (!file?.buffer) {
      throw new BadRequestException('Arquivo PDF é obrigatório.');
    }
    if (file.buffer.length === 0) {
      throw new BadRequestException(
        'O arquivo PDF está vazio. Verifique se o arquivo foi enviado corretamente.',
      );
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo: ${MAX_PDF_SIZE_BYTES / 1024 / 1024} MB.`,
      );
    }
    const mime = file.mimetype?.toLowerCase();
    if (mime !== 'application/pdf') {
      throw new BadRequestException('Apenas arquivos PDF são aceitos.');
    }

    let text: string;
    try {
      const parser = new PDFParse({ data: file.buffer });
      const result = await parser.getText();
      await parser.destroy();
      text = result?.text?.trim() ?? '';
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(
        `Não foi possível extrair texto do PDF. Verifique se o arquivo é válido e não está protegido por senha. Detalhe: ${msg}`,
      );
    }
    if (text.length < MIN_EXTRACTED_TEXT_LENGTH) {
      throw new BadRequestException(
        'Não foi possível extrair texto suficiente do PDF. Pode ser um PDF escaneado (apenas imagens); neste caso o sistema ainda não suporta extração por imagem.',
      );
    }

    const entries = this.parseItauExtractText(text);
    const errors: string[] = [];
    let expensesCreated = 0;
    let incomesCreated = 0;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const description =
        entry.description.trim().slice(0, 255) || 'Lançamento extrato';
      const dateStr = entry.date;
      const amount = Math.round(Math.abs(entry.value) * 100);

      if (amount <= 0) continue;

      try {
        if (entry.value < 0) {
          await this.expensesService.create(userId, {
            name: description,
            category: 'Outros',
            amount,
            date: dateStr,
            is_paid: false,
          });
          expensesCreated++;
        } else {
          await this.incomesService.create(userId, {
            name: description,
            category: 'Outros',
            amount,
            date: dateStr,
            isRecurring: false,
          });
          incomesCreated++;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Linha ${i + 1} (${description}): ${msg}`);
      }
    }

    return {
      expensesCreated,
      incomesCreated,
      errors,
    };
  }

  /**
   * Parseia o texto extraído do PDF do extrato Itaú.
   * Formato: DD/MM/AAAA DESCRIÇÃO valor [saldo]
   * Valor em BRL: -31,92 ou 1.000,00 (vírgula decimal, ponto milhar opcional).
   */
  private parseItauExtractText(text: string): ParsedEntry[] {
    const lines = text.split(/\r?\n/);
    const entries: ParsedEntry[] = [];
    const dateRegex = /^(\d{2}\/\d{2}\/\d{4})\s+/;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.length) continue;

      const dateMatch = line.match(dateRegex);
      if (!dateMatch) continue;

      const dateStr = dateMatch[1];
      const rest = line.slice(dateMatch[0].length).trim();

      if (rest.toUpperCase().startsWith('SALDO DO DIA')) continue;

      // Pode haver valor e saldo no fim (duas colunas); o valor do movimento é o primeiro número
      const valueAndBalance = rest.match(
        /(-?\d{1,3}(?:\.\d{3})*,\d{2}|-?\d+,\d{2})\s*(-?\d{1,3}(?:\.\d{3})*,\d{2}|-?\d+,\d{2})?$/,
      );
      if (!valueAndBalance) continue;

      const valueRaw = valueAndBalance[1];
      const value = this.parseBrlValue(valueRaw);
      if (value === null) continue;

      const description = rest
        .slice(0, rest.length - (valueAndBalance[0].length))
        .trim();
      if (!description) continue;

      const [d, m, a] = dateStr.split('/');
      const isoDate = `${a}-${m}-${d}`;
      entries.push({
        date: isoDate,
        description: description || 'Lançamento',
        value,
      });
    }

    return entries;
  }

  private parseBrlValue(raw: string): number | null {
    const normalized = raw.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    return Number.isFinite(num) ? num : null;
  }
}
