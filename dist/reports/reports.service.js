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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const openai_1 = __importDefault(require("openai"));
const config_1 = require("@nestjs/config");
const report_entity_1 = require("./report.entity");
const users_service_1 = require("../users/users.service");
const incomes_service_1 = require("../incomes/incomes.service");
const expenses_service_1 = require("../expenses/expenses.service");
const RECURRING_CATEGORIES = new Set([
    'Mercado',
    'Luz',
    'Água',
    'Gás',
    'Internet',
    'Investimentos',
    'Assinaturas',
    'Assinaturas educacionais',
    'Aluguel',
    'Condomínio',
    'Plano de saúde',
    'Streaming',
].map((s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
function isRecurringCategory(name) {
    const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return RECURRING_CATEGORIES.has(normalized);
}
let ReportsService = class ReportsService {
    reportsRepository;
    usersService;
    incomesService;
    expensesService;
    configService;
    openai = null;
    constructor(reportsRepository, usersService, incomesService, expensesService, configService) {
        this.reportsRepository = reportsRepository;
        this.usersService = usersService;
        this.incomesService = incomesService;
        this.expensesService = expensesService;
        this.configService = configService;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new openai_1.default({ apiKey });
        }
    }
    getPeriodKey(period) {
        if (period === 'from-start-to-today')
            return 'from-start-to-today';
        if (period === 'all-records')
            return 'all-records';
        throw new common_1.BadRequestException('Período inválido');
    }
    async getDateRange(userId, period) {
        const now = new Date();
        const today = new Date(now);
        today.setHours(23, 59, 59, 999);
        const firstDate = await this.incomesService.getFirstTransactionDate(userId);
        const lastDate = await this.incomesService.getLastTransactionDate(userId);
        const user = await this.usersService.findById(userId);
        if (period === 'all-records') {
            const startDate = firstDate ?? (user?.createdAt ? new Date(user.createdAt) : new Date(0));
            const endDate = lastDate ?? today;
            return {
                startDate: startDate instanceof Date ? startDate : new Date(startDate),
                endDate: endDate instanceof Date ? endDate : new Date(endDate),
                useAllRecords: true,
            };
        }
        const startDate = firstDate ?? (user?.createdAt ? new Date(user.createdAt) : new Date(0));
        return {
            startDate: startDate instanceof Date ? startDate : new Date(startDate),
            endDate: today,
            useAllRecords: false,
        };
    }
    async findAll(userId) {
        const user = await this.usersService.findById(userId);
        const plan = user?.plan ?? 'free';
        if (plan === 'free') {
            throw new common_1.ForbiddenException('Relatórios por IA são exclusivos para planos Pro e Premium. Faça upgrade para acessar.');
        }
        return this.reportsRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const user = await this.usersService.findById(userId);
        const plan = user?.plan ?? 'free';
        if (plan === 'free') {
            throw new common_1.ForbiddenException('Relatórios por IA são exclusivos para planos Pro e Premium. Faça upgrade para acessar.');
        }
        const report = await this.reportsRepository.findOne({
            where: { id, userId },
        });
        if (!report) {
            throw new common_1.NotFoundException('Relatório não encontrado');
        }
        return report;
    }
    async generate(userId, createReportDto) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.ForbiddenException('Usuário não encontrado');
        }
        const plan = user.plan ?? 'free';
        if (plan === 'free') {
            throw new common_1.ForbiddenException('Relatórios por IA são exclusivos para planos Pro e Premium. Faça upgrade para acessar.');
        }
        const period = createReportDto.period;
        const periodKey = this.getPeriodKey(period);
        const periodType = period;
        if (plan === 'pro') {
            const now = new Date();
            const day = now.getDay();
            const diffToMonday = day === 0 ? -6 : 1 - day;
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() + diffToMonday);
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            const reportsThisWeek = await this.reportsRepository
                .createQueryBuilder('report')
                .where('report.user_id = :userId', { userId })
                .andWhere('report.created_at >= :weekStart', { weekStart })
                .andWhere('report.created_at <= :weekEnd', { weekEnd })
                .getCount();
            if (reportsThisWeek >= 1) {
                const nextMonday = new Date(weekStart);
                nextMonday.setDate(weekStart.getDate() + 7);
                throw new common_1.HttpException({
                    message: 'Seu plano Pro permite 1 relatório por semana. O próximo estará disponível em breve.',
                    nextAvailableAt: nextMonday.toISOString().split('T')[0],
                }, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
        }
        const existing = await this.reportsRepository.findOne({
            where: { userId, periodType, periodKey },
        });
        if (existing) {
            throw new common_1.ConflictException('Já existe um relatório para este período. Consulte o histórico.');
        }
        const { startDate, endDate, useAllRecords } = await this.getDateRange(userId, period);
        const [stats, categoriesWithMonthCount] = await Promise.all([
            useAllRecords
                ? this.incomesService.getStats(userId)
                : this.incomesService.getStats(userId, undefined, startDate, endDate),
            useAllRecords
                ? this.expensesService.getByCategoryWithMonthCount(userId)
                : this.expensesService.getByCategoryWithMonthCount(userId, undefined, startDate, endDate),
        ]);
        const categoriesWithForecast = categoriesWithMonthCount.map((c) => {
            const valueReais = c.value / 100;
            const monthsWithExpenses = Math.max(1, c.monthsWithExpenses);
            const avgMonthly = valueReais / monthsWithExpenses;
            const projectedAnnual = avgMonthly * 12;
            return {
                name: c.name,
                value: valueReais,
                percentage: c.percentage,
                monthsWithExpenses,
                avgMonthly,
                projectedAnnual,
            };
        });
        const recurringForForecast = categoriesWithForecast.filter((c) => isRecurringCategory(c.name));
        const totalAvgMonthly = recurringForForecast.reduce((s, c) => s + c.avgMonthly, 0);
        const projectedAnnualExpenses = totalAvgMonthly * 12;
        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        const AVG_DAYS_PER_MONTH = 30.44;
        const daysInPeriod = Math.max(1, (endDate.getTime() - startDate.getTime()) / MS_PER_DAY);
        const monthsInPeriod = Math.max(1, daysInPeriod / AVG_DAYS_PER_MONTH);
        const incomeReais = stats.income / 100;
        const avgMonthlyIncome = incomeReais / monthsInPeriod;
        const projectedAnnualIncome = avgMonthlyIncome * 12;
        const projectedYearEndBalance = projectedAnnualIncome - projectedAnnualExpenses;
        const financialData = {
            period: {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
            },
            income: stats.income / 100,
            expense: stats.expense / 100,
            balance: stats.balance / 100,
            categories: categoriesWithForecast.map(({ name, value, percentage }) => ({
                name,
                value,
                percentage,
            })),
            forecast: {
                avgMonthlyTotal: Math.round(totalAvgMonthly * 100) / 100,
                projectedAnnualExpenses: Math.round(projectedAnnualExpenses * 100) / 100,
                projectedAnnualIncome: Math.round(projectedAnnualIncome * 100) / 100,
                projectedYearEndBalance: Math.round(projectedYearEndBalance * 100) / 100,
                byCategory: recurringForForecast.map((c) => ({
                    name: c.name,
                    monthsWithExpenses: c.monthsWithExpenses,
                    avgMonthly: Math.round(c.avgMonthly * 100) / 100,
                    projectedAnnual: Math.round(c.projectedAnnual * 100) / 100,
                })),
            },
        };
        if (!this.openai) {
            throw new common_1.BadRequestException('Serviço de relatórios temporariamente indisponível. Tente novamente mais tarde.');
        }
        const systemPrompt = `Você é um consultor financeiro pessoal especializado. Analise os dados financeiros fornecidos e gere um relatório em português do Brasil.
O relatório deve incluir:
1. Resumo executivo da saúde financeira (2-3 frases)
2. Análise de receitas e despesas
3. Principais categorias de gastos
4. Previsão/Projeção: use os dados de forecast. Inclua: (a) Total de Despesas Previstas (projectedAnnualExpenses) e detalhe por categoria recorrente em forecast.byCategory; (b) Projeção de Receitas anuais (projectedAnnualIncome) baseada na média do período; (c) Saldo projetado ao final do ano (projectedYearEndBalance) = receitas projetadas - despesas projetadas. Analise se o saldo projetado é positivo/negativo e o que isso significa. NÃO inclua Eletrônicos, Fatura cartão ou compras únicas na previsão. Dados podem ser parciais.
5. Sugestões práticas e acionáveis (3-5 itens)
6. Conclusão com perspectiva positiva
Use tom profissional e amigável. Formate a resposta em markdown. Seja objetivo e útil.`;
        const userPrompt = `Analise os seguintes dados financeiros e gere um relatório de saúde financeira.
Os dados incluem "forecast" com: projectedAnnualExpenses (despesas recorrentes previstas), projectedAnnualIncome (receitas projetadas para o ano), projectedYearEndBalance (saldo previsto ao final do ano = receitas - despesas). Inclua análise do saldo projetado na seção de previsão. NÃO inclua compras únicas na previsão.

\`\`\`json
${JSON.stringify(financialData, null, 2)}
\`\`\`

Gere o relatório em markdown, incluindo a seção de previsão/projeção.`;
        let completion;
        try {
            completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.7,
            });
        }
        catch (err) {
            const status = err?.status;
            const code = err?.code;
            if (status === 429 || code === 'insufficient_quota') {
                throw new common_1.HttpException('A cota da API de IA foi excedida. Verifique seu plano e billing em platform.openai.com. Tente novamente mais tarde.', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            throw new common_1.HttpException('Erro ao gerar relatório. Tente novamente mais tarde.', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        const content = completion.choices[0]?.message?.content ??
            'Não foi possível gerar o relatório. Tente novamente.';
        const report = this.reportsRepository.create({
            userId,
            content,
            periodStart: startDate,
            periodEnd: endDate,
            periodType,
            periodKey,
        });
        return this.reportsRepository.save(report);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        incomes_service_1.IncomesService,
        expenses_service_1.ExpensesService,
        config_1.ConfigService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map