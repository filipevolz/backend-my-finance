import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Expense } from './expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CategoriesService } from '../categories/categories.service';
import { CategoryType } from '../categories/category.entity';
import { CardsService } from '../cards/cards.service';
import OpenAI from 'openai';

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

interface RawExpenseFromAi {
  descricao?: string;
  estabelecimento?: string;
  categoria: string;
  dataCompra: string;
  valor: number;
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    private categoriesService: CategoriesService,
    private cardsService: CardsService,
    private configService: ConfigService,
  ) {}

  async create(
    userId: string,
    createExpenseDto: CreateExpenseDto,
  ): Promise<Expense> {
    // Converter string YYYY-MM-DD para Date object sem problemas de timezone
    const dateStr = createExpenseDto.date.split('T')[0];
    const [year, month, day] = dateStr.split('-').map(Number);
    const purchaseDate = new Date(year, month - 1, day);

    const installments = createExpenseDto.installments || 1;
    const isParceled = installments > 1 && createExpenseDto.cardId;

    // Se foi pago no cartão, verificar limite disponível
    let card: Awaited<ReturnType<typeof this.cardsService.findOne>> | null = null;
    if (createExpenseDto.cardId) {
      card = await this.cardsService.findOne(
        createExpenseDto.cardId,
        userId,
      );
      
      // Recalcular o limite usado atual (antes de criar esta expense)
      await this.cardsService.recalculateUsedLimit(createExpenseDto.cardId, userId);
      
      // Buscar o cartão novamente para ter o usedLimit atualizado
      const updatedCard = await this.cardsService.findOne(
        createExpenseDto.cardId,
        userId,
      );
      
      // Calcular limite disponível
      const availableLimit = (updatedCard.totalLimit ?? 0) - (updatedCard.usedLimit ?? 0);
      
      if (availableLimit < createExpenseDto.amount) {
        throw new BadRequestException(
          'Limite disponível do cartão insuficiente',
        );
      }
    }

    // Se for parcelado, criar múltiplas despesas com mesmo groupId
    if (isParceled && createExpenseDto.cardId && card) {
      // Gerar um UUID para o grupo
      const groupId = randomUUID();
      const installmentAmount = Math.floor(createExpenseDto.amount / installments);
      const lastInstallmentAmount = createExpenseDto.amount - (installmentAmount * (installments - 1));
      
      const expenses: Expense[] = [];

      // Calcular a data da primeira parcela baseado no fechamento do cartão
      const purchaseDay = purchaseDate.getDate();
      const purchaseMonth = purchaseDate.getMonth();
      const purchaseYear = purchaseDate.getFullYear();

      // Se a compra foi antes do fechamento, a primeira parcela entra no mês atual
      // Se foi depois do fechamento, a primeira parcela entra no próximo mês
      let firstInstallmentMonth = purchaseMonth;
      let firstInstallmentYear = purchaseYear;

      if (purchaseDay > card.closingDate) {
        // Compra depois do fechamento, primeira parcela no próximo mês
        firstInstallmentMonth = purchaseMonth + 1;
        if (firstInstallmentMonth > 11) {
          firstInstallmentMonth = 0;
          firstInstallmentYear = purchaseYear + 1;
        }
      }

      // Criar cada parcela
      for (let i = 0; i < installments; i++) {
        // Calcular mês da parcela
        let installmentMonth = firstInstallmentMonth + i;
        let installmentYear = firstInstallmentYear;

        // Ajustar se passar de dezembro
        while (installmentMonth > 11) {
          installmentMonth -= 12;
          installmentYear += 1;
        }

        // Data de vencimento do cartão no mês da parcela
        const dueDate = new Date(installmentYear, installmentMonth, card.dueDate);
        
        // Valor da parcela (última pode ter diferença de centavos)
        const amount = i === installments - 1 ? lastInstallmentAmount : installmentAmount;

        const expense = this.expensesRepository.create({
          userId,
          name: createExpenseDto.name ? `${createExpenseDto.name} (${i + 1}/${installments})` : null,
          category: createExpenseDto.category,
          amount,
          date: dueDate, // Data de vencimento do cartão
          purchaseDate: purchaseDate, // Data original da compra
          is_paid: false, // Parcelas não são pagas automaticamente
          cardId: createExpenseDto.cardId,
          installments,
          installmentNumber: i + 1,
          groupId, // Todas as parcelas têm o mesmo groupId
        });

        expenses.push(expense);
      }

      // Salvar todas as parcelas
      const savedExpenses = await this.expensesRepository.save(expenses);
      
      // Recalcular o limite usado do cartão após criar as expenses
      if (createExpenseDto.cardId) {
        await this.cardsService.recalculateUsedLimit(createExpenseDto.cardId, userId);
      }
      
      return savedExpenses[0]; // Retornar a primeira parcela
    }

    // Despesa única (não parcelada)
    // Se foi paga no cartão, calcular a data de vencimento baseada no fechamento
    let expenseDate = purchaseDate;
    let expensePurchaseDate: Date | null = null;
    
    if (createExpenseDto.cardId && card) {
      const purchaseDay = purchaseDate.getDate();
      const purchaseMonth = purchaseDate.getMonth();
      const purchaseYear = purchaseDate.getFullYear();

      // Se a compra foi antes ou no dia do fechamento, entra na fatura do mês atual
      // Se foi depois do fechamento, entra na fatura do próximo mês
      let dueMonth = purchaseMonth;
      let dueYear = purchaseYear;

      if (purchaseDay > card.closingDate) {
        // Compra depois do fechamento, vencimento no próximo mês
        dueMonth = purchaseMonth + 1;
        if (dueMonth > 11) {
          dueMonth = 0;
          dueYear = purchaseYear + 1;
        }
      }

      // Data de vencimento do cartão
      expenseDate = new Date(dueYear, dueMonth, card.dueDate);
      // Guardar a data original da compra para exibição
      expensePurchaseDate = purchaseDate;
    }

    const expense = this.expensesRepository.create({
      userId,
      name: createExpenseDto.name || null,
      category: createExpenseDto.category,
      amount: createExpenseDto.amount,
      date: expenseDate, // Data de vencimento se for cartão, senão data da compra
      purchaseDate: expensePurchaseDate, // Data original da compra (quando diferente da data de vencimento)
      is_paid: createExpenseDto.is_paid ?? false,
      cardId: createExpenseDto.cardId || null,
      installments: installments > 1 ? installments : null,
      installmentNumber: null,
    });

    const savedExpense = await this.expensesRepository.save(expense);
    
    // Recalcular o limite usado do cartão após criar a expense
    if (createExpenseDto.cardId) {
      await this.cardsService.recalculateUsedLimit(createExpenseDto.cardId, userId);
    }
    
    return savedExpense;
  }

  async findAll(userId: string): Promise<Expense[]> {
    return await this.expensesRepository.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada');
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta despesa',
      );
    }

    return expense;
  }

  async update(
    id: string,
    userId: string,
    updateExpenseDto: UpdateExpenseDto,
    updateGroup?: boolean,
  ): Promise<Expense> {
    const expense = await this.findOne(id, userId);

    // Se deve atualizar o grupo inteiro e a expense tem groupId
    if (updateGroup && expense.groupId) {
      const groupExpenses = await this.findByGroupId(expense.groupId, userId);
      
      // Atualizar todas as expenses do grupo
      for (const groupExpense of groupExpenses) {
        Object.assign(groupExpense, updateExpenseDto);

        if (updateExpenseDto.date) {
          // Para expenses parceladas, ajustar a data baseado no installmentNumber
          const dateStr = updateExpenseDto.date.split('T')[0];
          const [year, month, day] = dateStr.split('-').map(Number);
          const baseDate = new Date(year, month - 1, day);
          
          // Se for parcelada, manter a lógica de datas das parcelas
          if (groupExpense.installments && groupExpense.installmentNumber) {
            // Manter a data original da parcela (não alterar)
            // Ou implementar lógica para recalcular datas das parcelas
            // Por enquanto, não alteramos a data de parcelas
          } else {
            groupExpense.date = baseDate;
          }
        }

        await this.expensesRepository.save(groupExpense);
      }

      return expense; // Retornar a expense original
    }

    // Atualização individual
    const oldCardId = expense.cardId;
    const oldAmount = expense.amount;
    
    // Determinar o novo cardId - se foi enviado no DTO (mesmo que null), usar o valor do DTO
    // Se não foi enviado, manter o valor atual
    let newCardId: string | null | undefined;
    if (updateExpenseDto.hasOwnProperty('cardId')) {
      newCardId = updateExpenseDto.cardId ?? null;
    } else {
      newCardId = expense.cardId;
    }
    
    const newAmount = updateExpenseDto.amount !== undefined ? updateExpenseDto.amount : expense.amount;

    // Normalizar para comparação (null e undefined são tratados como "sem cartão")
    const oldCardIdNormalized = oldCardId ?? null;
    const newCardIdNormalized = newCardId ?? null;

    // Se mudou o cartão ou o valor, verificar limite antes de atualizar
    const cardChanged = oldCardIdNormalized !== newCardIdNormalized;
    const amountChanged = oldAmount !== newAmount;
    
    if (cardChanged || amountChanged) {
      // Se agora tem cartão, verificar limite disponível ANTES de atualizar
      if (newCardIdNormalized) {
        const newCard = await this.cardsService.findOne(newCardIdNormalized, userId);
        
        // Recalcular o limite usado atual (sem incluir esta expense ainda)
        await this.cardsService.recalculateUsedLimit(newCardIdNormalized, userId);
        
        // Buscar o cartão novamente para ter o usedLimit atualizado
        const updatedCard = await this.cardsService.findOne(newCardIdNormalized, userId);
        
        // Calcular limite disponível
        const availableLimit = (updatedCard.totalLimit ?? 0) - (updatedCard.usedLimit ?? 0);
        
        if (availableLimit < newAmount) {
          throw new BadRequestException(
            'Limite disponível do cartão insuficiente',
          );
        }
      }
    }

    // Atualizar a expense primeiro
    Object.assign(expense, updateExpenseDto);

    // Se a data foi atualizada ou o cartão mudou, recalcular a data de vencimento se tiver cartão
    if (updateExpenseDto.date || cardChanged) {
      // Converter string YYYY-MM-DD para Date object sem problemas de timezone
      const dateStr = (updateExpenseDto.date || expense.date.toISOString().split('T')[0]).split('T')[0];
      const [year, month, day] = dateStr.split('-').map(Number);
      const purchaseDate = new Date(year, month - 1, day);

      // Se tem cartão, calcular data de vencimento baseada no fechamento
      if (newCardIdNormalized) {
        const card = await this.cardsService.findOne(newCardIdNormalized, userId);
        const purchaseDay = purchaseDate.getDate();
        const purchaseMonth = purchaseDate.getMonth();
        const purchaseYear = purchaseDate.getFullYear();

        // Se a compra foi antes ou no dia do fechamento, entra na fatura do mês atual
        // Se foi depois do fechamento, entra na fatura do próximo mês
        let dueMonth = purchaseMonth;
        let dueYear = purchaseYear;

        if (purchaseDay > card.closingDate) {
          // Compra depois do fechamento, vencimento no próximo mês
          dueMonth = purchaseMonth + 1;
          if (dueMonth > 11) {
            dueMonth = 0;
            dueYear = purchaseYear + 1;
          }
        }

        // Data de vencimento do cartão
        expense.date = new Date(dueYear, dueMonth, card.dueDate);
        // Guardar a data original da compra para exibição
        expense.purchaseDate = purchaseDate;
      } else {
        // Se não tem cartão, usar a data da compra
        expense.date = purchaseDate;
        expense.purchaseDate = null; // Limpar purchaseDate quando não tem cartão
      }
    }

    // Salvar a expense primeiro
    const savedExpense = await this.expensesRepository.save(expense);

    // Depois de salvar, recalcular os limites dos cartões afetados
    if (cardChanged || amountChanged) {
      // Se tinha cartão antes (e mudou), recalcular o limite usado do cartão antigo
      if (oldCardIdNormalized && oldCardIdNormalized !== newCardIdNormalized) {
        await this.cardsService.recalculateUsedLimit(oldCardIdNormalized, userId);
      }

      // Se agora tem cartão, recalcular o limite usado do cartão novo
      if (newCardIdNormalized) {
        await this.cardsService.recalculateUsedLimit(newCardIdNormalized, userId);
      }
    }

    return savedExpense;
  }

  async findByGroupId(groupId: string, userId: string): Promise<Expense[]> {
    return await this.expensesRepository.find({
      where: { groupId, userId },
      order: { installmentNumber: 'ASC' },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const expense = await this.findOne(id, userId);
    const cardId = expense.cardId;
    
    // Remover a expense primeiro
    await this.expensesRepository.remove(expense);
    
    // Depois, recalcular o limite usado do cartão (se tinha cartão)
    if (cardId) {
      await this.cardsService.recalculateUsedLimit(cardId, userId);
    }
  }

  async removeGroup(groupId: string, userId: string): Promise<void> {
    const expenses = await this.findByGroupId(groupId, userId);
    
    if (expenses.length === 0) {
      throw new NotFoundException('Grupo de despesas não encontrado');
    }

    const cardId = expenses[0].cardId;
    
    // Remover as expenses primeiro
    await this.expensesRepository.remove(expenses);
    
    // Depois, recalcular o limite usado do cartão (se tinha cartão)
    if (cardId) {
      await this.cardsService.recalculateUsedLimit(cardId, userId);
    }
  }

  async findByCategory(userId: string, category: string): Promise<Expense[]> {
    return await this.expensesRepository.find({
      where: { userId, category },
      order: { date: 'DESC' },
    });
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Expense[]> {
    // Formatar datas para YYYY-MM-DD (formato esperado pelo PostgreSQL date)
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    return await this.expensesRepository
      .createQueryBuilder('expense')
      .where('expense.user_id = :userId', { userId })
      .andWhere('expense.date >= :startDate', { startDate: startDateStr })
      .andWhere('expense.date <= :endDate', { endDate: endDateStr })
      .orderBy('expense.date', 'DESC')
      .getMany();
  }

  async findByPeriod(
    userId: string,
    period: 'this-month' | 'last-month' | 'this-year' | 'last-12-months',
  ): Promise<Expense[]> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'this-month': {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        // Último dia do mês atual
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      }
      case 'last-month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = lastMonth;
        // Último dia do mês passado
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      }
      case 'this-year': {
        startDate = new Date(now.getFullYear(), 0, 1);
        // Último dia do ano atual
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      }
      case 'last-12-months': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        // Data atual (último dia do período)
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      }
    }

    // Ajustar para incluir todo o dia final
    endDate.setHours(23, 59, 59, 999);

    return await this.findByDateRange(userId, startDate, endDate);
  }

  async getStats(
    userId: string,
    period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months',
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    // Buscar despesas do período atual
    let currentExpenses: Expense[];
    if (startDate && endDate) {
      currentExpenses = await this.findByDateRange(userId, startDate, endDate);
    } else if (period) {
      currentExpenses = await this.findByPeriod(userId, period);
    } else {
      currentExpenses = await this.findAll(userId);
    }
    const currentExpense = currentExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );

    return currentExpense;
  }

  async getByCategory(
    userId: string,
    period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months',
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    Array<{
      name: string;
      percentage: number;
      color: string;
      icon: string | null;
      value: number;
    }>
  > {
    let expenses: Expense[];
    if (startDate && endDate) {
      expenses = await this.findByDateRange(userId, startDate, endDate);
    } else if (period) {
      expenses = await this.findByPeriod(userId, period);
    } else {
      expenses = await this.findAll(userId);
    }
    const totalExpense = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );

    // Agrupar por categoria
    const categoryMap = new Map<
      string,
      { amount: number; icon: string | null }
    >();

    for (const expense of expenses) {
      const existing = categoryMap.get(expense.category);
      if (existing) {
        existing.amount += Number(expense.amount);
      } else {
        categoryMap.set(expense.category, {
          amount: Number(expense.amount),
          icon: null,
        });
      }
    }

    // Buscar informações das categorias (incluindo ícones)
    const categories = await this.categoriesService.findAll(CategoryType.EXPENSE);
    const categoryInfoMap = new Map(
      categories.map((cat) => [cat.name, { icon: cat.icon, color: '' }]),
    );

    // Cores pré-definidas para o gráfico
    const colors = [
      '#9333ea',
      '#ef4444',
      '#60a5fa',
      '#4ade80',
      '#f97316',
      '#f59e0b',
      '#ec4899',
      '#8b5cf6',
      '#06b6d4',
      '#84cc16',
    ];

    // Converter para array e calcular porcentagens
    const result = Array.from(categoryMap.entries())
      .map(([name, data], index) => {
        const categoryInfo = categoryInfoMap.get(name);
        const percentage =
          totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0;

        return {
          name,
          percentage: Math.round(percentage * 100) / 100, // 2 casas decimais
          color: colors[index % colors.length],
          icon: categoryInfo?.icon || null,
          value: data.amount,
        };
      })
      .sort((a, b) => b.value - a.value) // Ordenar por valor (maior primeiro)
      .slice(0, 10); // Limitar a 10 categorias

    return result;
  }

  async importFromPdf(
    userId: string,
    file: Express.Multer.File,
    cardId?: string | null,
  ): Promise<{ data: Expense[]; errors?: string[] }> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new BadRequestException(
        'OPENAI_API_KEY não configurada. Configure a variável de ambiente.',
      );
    }

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
      const msg =
        err instanceof Error ? err.message : String(err);
      throw new BadRequestException(
        `Não foi possível extrair texto do PDF. Verifique se o arquivo é válido e não está protegido por senha. Detalhe: ${msg}`,
      );
    }
    if (text.length < MIN_EXTRACTED_TEXT_LENGTH) {
      throw new BadRequestException(
        'Não foi possível extrair texto suficiente do PDF. Pode ser um PDF escaneado (apenas imagens); neste caso o sistema ainda não suporta extração por imagem.',
      );
    }

    const categories = await this.categoriesService.findAll(
      CategoryType.EXPENSE,
    );
    const categoryNames = categories.map((c) => c.name).join(', ');

    const openai = new OpenAI({ apiKey });
    const prompt = `Você é um assistente que extrai lançamentos de faturas de cartão de crédito a partir de texto.

Extraia TODOS os lançamentos/transações do texto abaixo. Para cada um, retorne um objeto com:
- descricao ou estabelecimento: nome do estabelecimento ou descrição (string)
- categoria: uma das categorias exatamente como nesta lista: ${categoryNames}. Escolha a mais adequada. Se não houver correspondência, use "Outros".
- dataCompra: data da compra no formato DD/MM/AAAA
- valor: valor em reais (número positivo, ex: 50.00)

Retorne APENAS um array JSON válido, sem markdown, sem explicação. Exemplo:
[{"descricao":"Posto Shell","categoria":"Combustível","dataCompra":"15/02/2026","valor":100.50}]

Texto da fatura:
---
${text.slice(0, 12000)}
---`;

    let rawContent: string;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
      });
      rawContent =
        completion.choices?.[0]?.message?.content?.trim() ?? '';
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao chamar OpenAI';
      throw new BadRequestException(`Falha ao processar com IA: ${msg}`);
    }

    let parsed: RawExpenseFromAi[];
    try {
      const jsonStr = rawContent
        .replace(/^```json\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();
      parsed = JSON.parse(jsonStr) as RawExpenseFromAi[];
      if (!Array.isArray(parsed)) {
        parsed = [];
      }
    } catch {
      throw new BadRequestException(
        'Resposta da IA não é um JSON válido. Tente outro PDF.',
      );
    }

    const created: Expense[] = [];
    const errors: string[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      const name =
        (item.descricao || item.estabelecimento || '').trim() || 'Lançamento';
      const category = (item.categoria || 'Outros').trim();
      const valor = Number(item.valor);
      if (!Number.isFinite(valor) || valor <= 0) {
        errors.push(`Item ${i + 1}: valor inválido ignorado.`);
        continue;
      }
      const amount = Math.round(valor * 100);

      let dateStr: string;
      try {
        const [d, m, a] = (item.dataCompra || '').split(/[/-]/);
        if (d && m && a) {
          const day = d.padStart(2, '0');
          const month = m.padStart(2, '0');
          const year = a.length === 2 ? `20${a}` : a;
          dateStr = `${year}-${month}-${day}`;
        } else {
          dateStr = new Date().toISOString().split('T')[0];
        }
      } catch {
        dateStr = new Date().toISOString().split('T')[0];
      }

      const dto: CreateExpenseDto = {
        name,
        category,
        amount,
        date: dateStr,
        is_paid: false,
        cardId: cardId || undefined,
      };

      const duplicate = await this.findDuplicateExpenseForImport(
        userId,
        cardId || undefined,
        name,
        amount,
        dateStr,
      );
      if (duplicate) continue;

      try {
        const expense = await this.create(userId, dto);
        created.push(expense);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : String(err);
        errors.push(`Item ${i + 1} (${name}): ${msg}`);
      }
    }

    return { data: created, errors: errors.length > 0 ? errors : undefined };
  }

  /**
   * Verifica se já existe despesa com mesmo cartão (ou sem cartão), nome, valor e data (evita duplicata na reimportação).
   */
  private async findDuplicateExpenseForImport(
    userId: string,
    cardId: string | null | undefined,
    name: string,
    amount: number,
    dateStr: string,
  ): Promise<Expense | null> {
    const expenseDate = new Date(dateStr);
    const start = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const qb = this.expensesRepository
      .createQueryBuilder('e')
      .where('e.user_id = :userId', { userId })
      .andWhere('e.amount = :amount', { amount })
      .andWhere('e.name = :name', { name })
      .andWhere('e.date >= :start', { start })
      .andWhere('e.date < :end', { end });
    if (cardId) {
      qb.andWhere('e.card_id = :cardId', { cardId });
    } else {
      qb.andWhere('e.card_id IS NULL');
    }
    const existing = await qb.getOne();
    return existing ?? null;
  }
}
