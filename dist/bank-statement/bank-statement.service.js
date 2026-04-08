"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankStatementService = void 0;
const common_1 = require("@nestjs/common");
const expenses_service_1 = require("../expenses/expenses.service");
const incomes_service_1 = require("../incomes/incomes.service");
function getPDFParse() {
    try {
        const mod = require('pdf-parse');
        return mod.PDFParse;
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (/DOMMatrix|@napi-rs\/canvas|Cannot find module/.test(msg)) {
            throw new common_1.BadRequestException('Importação de PDF não disponível neste ambiente (ex.: Vercel serverless). Use um ambiente com suporte a canvas ou importe o PDF localmente.');
        }
        throw err;
    }
}
const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;
const MIN_EXTRACTED_TEXT_LENGTH = 50;
let BankStatementService = class BankStatementService {
    expensesService;
    incomesService;
    constructor(expensesService, incomesService) {
        this.expensesService = expensesService;
        this.incomesService = incomesService;
    }
    async importFromPdf(userId, file) {
        if (!file?.buffer) {
            throw new common_1.BadRequestException('Arquivo PDF é obrigatório.');
        }
        if (file.buffer.length === 0) {
            throw new common_1.BadRequestException('O arquivo PDF está vazio. Verifique se o arquivo foi enviado corretamente.');
        }
        if (file.size > MAX_PDF_SIZE_BYTES) {
            throw new common_1.BadRequestException(`Arquivo muito grande. Tamanho máximo: ${MAX_PDF_SIZE_BYTES / 1024 / 1024} MB.`);
        }
        const mime = file.mimetype?.toLowerCase();
        if (mime !== 'application/pdf') {
            throw new common_1.BadRequestException('Apenas arquivos PDF são aceitos.');
        }
        let text;
        try {
            const PDFParse = getPDFParse();
            const parser = new PDFParse({ data: file.buffer });
            const result = await parser.getText();
            await parser.destroy();
            text = result?.text?.trim() ?? '';
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            throw new common_1.BadRequestException(`Não foi possível extrair texto do PDF. Verifique se o arquivo é válido e não está protegido por senha. Detalhe: ${msg}`);
        }
        if (text.length < MIN_EXTRACTED_TEXT_LENGTH) {
            throw new common_1.BadRequestException('Não foi possível extrair texto suficiente do PDF. Pode ser um PDF escaneado (apenas imagens); neste caso o sistema ainda não suporta extração por imagem.');
        }
        const entries = this.parseItauExtractText(text);
        const errors = [];
        let expensesCreated = 0;
        let incomesCreated = 0;
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const description = entry.description.trim().slice(0, 255) || 'Lançamento extrato';
            const dateStr = entry.date;
            const amount = Math.round(Math.abs(entry.value) * 100);
            if (amount <= 0)
                continue;
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
                }
                else {
                    await this.incomesService.create(userId, {
                        name: description,
                        category: 'Outros',
                        amount,
                        date: dateStr,
                        isRecurring: false,
                    });
                    incomesCreated++;
                }
            }
            catch (err) {
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
    parseItauExtractText(text) {
        const lines = text.split(/\r?\n/);
        const entries = [];
        const dateRegex = /^(\d{2}\/\d{2}\/\d{4})\s+/;
        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.length)
                continue;
            const dateMatch = line.match(dateRegex);
            if (!dateMatch)
                continue;
            const dateStr = dateMatch[1];
            const rest = line.slice(dateMatch[0].length).trim();
            if (rest.toUpperCase().startsWith('SALDO DO DIA'))
                continue;
            const valueAndBalance = rest.match(/(-?\d{1,3}(?:\.\d{3})*,\d{2}|-?\d+,\d{2})\s*(-?\d{1,3}(?:\.\d{3})*,\d{2}|-?\d+,\d{2})?$/);
            if (!valueAndBalance)
                continue;
            const valueRaw = valueAndBalance[1];
            const value = this.parseBrlValue(valueRaw);
            if (value === null)
                continue;
            const description = rest
                .slice(0, rest.length - (valueAndBalance[0].length))
                .trim();
            if (!description)
                continue;
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
    parseBrlValue(raw) {
        const normalized = raw.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(normalized);
        return Number.isFinite(num) ? num : null;
    }
};
exports.BankStatementService = BankStatementService;
exports.BankStatementService = BankStatementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [expenses_service_1.ExpensesService,
        incomes_service_1.IncomesService])
], BankStatementService);
//# sourceMappingURL=bank-statement.service.js.map