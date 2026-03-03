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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const income_entity_1 = require("./income.entity");
const expenses_service_1 = require("../expenses/expenses.service");
const expense_entity_1 = require("../expenses/expense.entity");
const categories_service_1 = require("../categories/categories.service");
const dateOnlyToString_1 = require("../helpers/dateOnlyToString");
let IncomesService = class IncomesService {
    incomesRepository;
    expensesRepository;
    expensesService;
    categoriesService;
    constructor(incomesRepository, expensesRepository, expensesService, categoriesService) {
        this.incomesRepository = incomesRepository;
        this.expensesRepository = expensesRepository;
        this.expensesService = expensesService;
        this.categoriesService = categoriesService;
    }
    normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
    async create(userId, createIncomeDto) {
        const { name, category, amount, date, isRecurring } = createIncomeDto;
        const dateStr = date.split('T')[0];
        const [year, month, day] = dateStr.split('-').map(Number);
        const baseDate = new Date(year, month - 1, day);
        if (isRecurring) {
            const recurringGroupId = (0, uuid_1.v4)();
            const incomes = [];
            for (let i = 0; i < 12; i++) {
                const incomeDate = new Date(year, month - 1 + i, day);
                const income = this.incomesRepository.create({
                    userId,
                    name,
                    category,
                    amount,
                    date: incomeDate,
                    isRecurring: true,
                    recurringGroupId,
                });
                incomes.push(income);
            }
            return await this.incomesRepository.save(incomes);
        }
        else {
            const income = this.incomesRepository.create({
                userId,
                name,
                category,
                amount,
                date: baseDate,
                isRecurring: false,
                recurringGroupId: null,
            });
            return [await this.incomesRepository.save(income)];
        }
    }
    async findAll(userId) {
        return await this.incomesRepository.find({
            where: { userId },
            order: { date: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const income = await this.incomesRepository.findOne({
            where: { id },
        });
        if (!income) {
            throw new common_1.NotFoundException('Receita não encontrada');
        }
        if (income.userId !== userId) {
            throw new common_1.ForbiddenException('Você não tem permissão para acessar esta receita');
        }
        return income;
    }
    async update(id, userId, updateIncomeDto) {
        const income = await this.findOne(id, userId);
        Object.assign(income, updateIncomeDto);
        if (updateIncomeDto.date) {
            const dateStr = updateIncomeDto.date.split('T')[0];
            const [year, month, day] = dateStr.split('-').map(Number);
            income.date = new Date(year, month - 1, day);
        }
        return await this.incomesRepository.save(income);
    }
    async remove(id, userId) {
        const income = await this.findOne(id, userId);
        await this.incomesRepository.remove(income);
    }
    async findByCategory(userId, category) {
        return await this.incomesRepository.find({
            where: { userId, category },
            order: { date: 'DESC' },
        });
    }
    async findByDateRange(userId, startDate, endDate) {
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        const result = await this.incomesRepository
            .createQueryBuilder('income')
            .where('income.user_id = :userId', { userId })
            .andWhere('income.date >= :startDate', { startDate: startDateStr })
            .andWhere('income.date <= :endDate', { endDate: endDateStr })
            .orderBy('income.date', 'DESC')
            .getMany();
        const totalForUser = await this.incomesRepository.count({
            where: { userId },
        });
        return result;
    }
    async findByPeriod(userId, period) {
        const now = new Date();
        let startDate;
        let endDate;
        switch (period) {
            case 'this-month': {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            }
            case 'last-month': {
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                startDate = lastMonth;
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            }
            case 'this-year': {
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            }
            case 'last-12-months': {
                startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            }
        }
        endDate.setHours(23, 59, 59, 999);
        return await this.findByDateRange(userId, startDate, endDate);
    }
    async getStats(userId, period, startDate, endDate) {
        let currentIncomes;
        if (startDate && endDate) {
            currentIncomes = await this.findByDateRange(userId, startDate, endDate);
        }
        else if (period) {
            currentIncomes = await this.findByPeriod(userId, period);
        }
        else {
            currentIncomes = await this.findAll(userId);
        }
        const currentIncome = currentIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
        if (!period || (startDate && endDate)) {
            const currentExpense = await this.expensesService.getStats(userId, period, startDate, endDate);
            const balance = currentIncome - currentExpense;
            return {
                balance,
                balanceChange: 0,
                income: currentIncome,
                incomeChange: 0,
                expense: currentExpense,
                expenseChange: 0,
            };
        }
        let previousIncome = 0;
        let previousPeriod = null;
        switch (period) {
            case 'this-month': {
                previousPeriod = 'last-month';
                break;
            }
            case 'last-month': {
                const twoMonthsAgo = new Date();
                twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
                const previousMonthStart = new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 1);
                const previousMonthEnd = new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth() + 1, 0, 23, 59, 59, 999);
                const previousMonthIncomes = await this.findByDateRange(userId, previousMonthStart, previousMonthEnd);
                previousIncome = previousMonthIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
                break;
            }
            case 'this-year': {
                const lastYear = new Date();
                lastYear.setFullYear(lastYear.getFullYear() - 1);
                const lastYearIncomes = await this.findByDateRange(userId, new Date(lastYear.getFullYear(), 0, 1), new Date(lastYear.getFullYear(), 11, 31, 23, 59, 59, 999));
                previousIncome = lastYearIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
                break;
            }
            case 'last-12-months': {
                const now = new Date();
                const previous12MonthsStart = new Date(now.getFullYear(), now.getMonth() - 23, 1);
                const previous12MonthsEnd = new Date(now.getFullYear(), now.getMonth() - 12, 0, 23, 59, 59, 999);
                const previous12MonthsIncomes = await this.findByDateRange(userId, previous12MonthsStart, previous12MonthsEnd);
                previousIncome = previous12MonthsIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
                break;
            }
        }
        if (previousPeriod) {
            const previousIncomes = await this.findByPeriod(userId, previousPeriod);
            previousIncome = previousIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
        }
        const incomeChange = previousIncome === 0
            ? currentIncome > 0
                ? 100
                : 0
            : ((currentIncome - previousIncome) / previousIncome) * 100;
        const currentExpense = await this.expensesService.getStats(userId, period);
        let previousExpense = 0;
        if (previousPeriod) {
            previousExpense = await this.expensesService.getStats(userId, previousPeriod);
        }
        else {
            let previousStartDate;
            let previousEndDate;
            switch (period) {
                case 'last-month': {
                    const twoMonthsAgo = new Date();
                    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
                    previousStartDate = new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 1);
                    previousEndDate = new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth() + 1, 0, 23, 59, 59, 999);
                    const previousExpenses = await this.expensesService.findByDateRange(userId, previousStartDate, previousEndDate);
                    previousExpense = previousExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
                    break;
                }
                case 'this-year': {
                    const lastYear = new Date();
                    lastYear.setFullYear(lastYear.getFullYear() - 1);
                    const lastYearExpenses = await this.expensesService.findByDateRange(userId, new Date(lastYear.getFullYear(), 0, 1), new Date(lastYear.getFullYear(), 11, 31, 23, 59, 59, 999));
                    previousExpense = lastYearExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
                    break;
                }
                case 'last-12-months': {
                    const now2 = new Date();
                    const previous12MonthsStart = new Date(now2.getFullYear(), now2.getMonth() - 23, 1);
                    const previous12MonthsEnd = new Date(now2.getFullYear(), now2.getMonth() - 12, 0, 23, 59, 59, 999);
                    const previous12MonthsExpenses = await this.expensesService.findByDateRange(userId, previous12MonthsStart, previous12MonthsEnd);
                    previousExpense = previous12MonthsExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
                    break;
                }
            }
        }
        const expenseChange = previousExpense === 0
            ? currentExpense > 0
                ? 100
                : 0
            : ((currentExpense - previousExpense) / previousExpense) * 100;
        const balance = currentIncome - currentExpense;
        const previousBalance = previousIncome - previousExpense;
        const balanceChange = previousBalance === 0
            ? balance > 0
                ? 100
                : 0
            : ((balance - previousBalance) / previousBalance) * 100;
        return {
            balance,
            balanceChange: Math.round(balanceChange * 100) / 100,
            income: currentIncome,
            incomeChange: Math.round(incomeChange * 100) / 100,
            expense: currentExpense,
            expenseChange: Math.round(expenseChange * 100) / 100,
        };
    }
    async getLatestTransactions(userId, limit = 10) {
        const allCategories = await this.categoriesService.findAll();
        const categoryMap = new Map(allCategories
            .filter((cat) => cat.icon !== null)
            .map((cat) => [cat.name, cat.icon]));
        const incomes = await this.incomesRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
        const expenses = await this.expensesRepository
            .createQueryBuilder('expense')
            .where('expense.user_id = :userId', { userId })
            .orderBy('expense.created_at', 'DESC')
            .limit(limit)
            .getMany();
        const incomeTransactions = incomes.map((income) => {
            const dateStr = (0, dateOnlyToString_1.dateOnlyToString)(income.date);
            const categoryIcon = categoryMap.get(income.category) || '💰';
            return {
                id: income.id,
                description: income.name || income.category,
                categoryIcon,
                category: income.category,
                date: dateStr,
                amount: Number(income.amount),
                type: 'income',
                createdAt: income.createdAt,
            };
        });
        const expenseTransactions = expenses.map((expense) => {
            const dateStr = (0, dateOnlyToString_1.dateOnlyToString)(expense.date);
            const purchaseDateStr = expense.purchaseDate
                ? (0, dateOnlyToString_1.dateOnlyToString)(expense.purchaseDate)
                : null;
            const categoryIcon = categoryMap.get(expense.category) || '💰';
            return {
                id: expense.id,
                description: expense.name || expense.category,
                categoryIcon,
                category: expense.category,
                date: dateStr,
                purchaseDate: purchaseDateStr,
                amount: Number(expense.amount),
                type: 'expense',
                createdAt: expense.createdAt,
                is_paid: expense.is_paid,
            };
        });
        const allTransactionsWithCreatedAt = [
            ...incomeTransactions,
            ...expenseTransactions,
        ];
        const allTransactions = allTransactionsWithCreatedAt
            .sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        })
            .slice(0, limit)
            .map(({ createdAt, ...trans }) => trans);
        return allTransactions;
    }
    async getTransactions(userId, filters) {
        const allCategories = await this.categoriesService.findAll();
        const categoryMap = new Map(allCategories
            .filter((cat) => cat.icon !== null)
            .map((cat) => [cat.name, cat.icon]));
        let startDate;
        let endDate;
        if (filters.startDate && filters.endDate) {
            startDate = filters.startDate;
            endDate = filters.endDate;
        }
        else if (filters.period) {
            const periodDates = this.getPeriodDates(filters.period);
            startDate = periodDates.startDate;
            endDate = periodDates.endDate;
        }
        else if (filters.month && filters.year) {
            startDate = new Date(filters.year, filters.month - 1, 1);
            endDate = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);
        }
        else if (filters.year) {
            startDate = new Date(filters.year, 0, 1);
            endDate = new Date(filters.year, 11, 31, 23, 59, 59, 999);
        }
        let incomes = [];
        if (!filters.type || filters.type === 'income') {
            const incomesQuery = this.incomesRepository
                .createQueryBuilder('income')
                .where('income.user_id = :userId', { userId });
            if (startDate && endDate) {
                const startDateStr = startDate.toISOString().split('T')[0];
                const endDateStr = endDate.toISOString().split('T')[0];
                incomesQuery
                    .andWhere('income.date >= :startDate', { startDate: startDateStr })
                    .andWhere('income.date <= :endDate', { endDate: endDateStr });
            }
            if (filters.category) {
                incomesQuery.andWhere('income.category = :category', {
                    category: filters.category,
                });
            }
            if (filters.minAmount !== undefined) {
                incomesQuery.andWhere('income.amount >= :minAmount', {
                    minAmount: filters.minAmount,
                });
            }
            if (filters.maxAmount !== undefined) {
                incomesQuery.andWhere('income.amount <= :maxAmount', {
                    maxAmount: filters.maxAmount,
                });
            }
            if (filters.description) {
                const normalizedSearch = this.normalizeText(filters.description);
                incomesQuery.andWhere(`LOWER(TRANSLATE(income.name, 'áàãâéêíóôõúüçÁÀÃÂÉÊÍÓÔÕÚÜÇ', 'aaaaeeiooouucAAAAEEIOOOUUC')) LIKE LOWER(:description)`, {
                    description: `%${normalizedSearch}%`,
                });
            }
            incomes = await incomesQuery
                .orderBy('income.date', 'ASC')
                .addOrderBy('income.created_at', 'ASC')
                .getMany();
        }
        let expenses = [];
        if (!filters.type || filters.type === 'expense') {
            const expensesQuery = this.expensesRepository
                .createQueryBuilder('expense')
                .where('expense.user_id = :userId', { userId });
            if (startDate && endDate) {
                const startDateStr = startDate.toISOString().split('T')[0];
                const endDateStr = endDate.toISOString().split('T')[0];
                expensesQuery
                    .andWhere('expense.date >= :startDate', { startDate: startDateStr })
                    .andWhere('expense.date <= :endDate', { endDate: endDateStr });
            }
            if (filters.category) {
                expensesQuery.andWhere('expense.category = :category', {
                    category: filters.category,
                });
            }
            if (filters.minAmount !== undefined) {
                expensesQuery.andWhere('expense.amount >= :minAmount', {
                    minAmount: filters.minAmount,
                });
            }
            if (filters.maxAmount !== undefined) {
                expensesQuery.andWhere('expense.amount <= :maxAmount', {
                    maxAmount: filters.maxAmount,
                });
            }
            if (filters.description) {
                const normalizedSearch = this.normalizeText(filters.description);
                expensesQuery.andWhere(`LOWER(TRANSLATE(expense.name, 'áàãâéêíóôõúüçÁÀÃÂÉÊÍÓÔÕÚÜÇ', 'aaaaeeiooouucAAAAEEIOOOUUC')) LIKE LOWER(:description)`, {
                    description: `%${normalizedSearch}%`,
                });
            }
            expenses = await expensesQuery
                .orderBy('expense.date', 'ASC')
                .addOrderBy('expense.created_at', 'ASC')
                .getMany();
        }
        const incomeTransactions = incomes.map((income) => {
            const dateStr = (0, dateOnlyToString_1.dateOnlyToString)(income.date);
            const categoryIcon = categoryMap.get(income.category) || '💰';
            return {
                id: income.id,
                description: income.name || income.category,
                categoryIcon,
                category: income.category,
                date: dateStr,
                amount: Number(income.amount),
                type: 'income',
            };
        });
        const expenseTransactions = expenses.map((expense) => {
            const dateStr = (0, dateOnlyToString_1.dateOnlyToString)(expense.date);
            const purchaseDateStr = expense.purchaseDate
                ? (0, dateOnlyToString_1.dateOnlyToString)(expense.purchaseDate)
                : null;
            const categoryIcon = categoryMap.get(expense.category) || '💰';
            return {
                id: expense.id,
                description: expense.name || expense.category,
                categoryIcon,
                category: expense.category,
                date: dateStr,
                purchaseDate: purchaseDateStr,
                amount: Number(expense.amount),
                type: 'expense',
                is_paid: expense.is_paid,
            };
        });
        const allTransactions = [...incomeTransactions, ...expenseTransactions]
            .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateA.getTime() - dateB.getTime();
            }
            return a.id.localeCompare(b.id);
        });
        return allTransactions;
    }
    getPeriodDates(period) {
        const now = new Date();
        let startDate;
        let endDate;
        switch (period) {
            case 'this-month': {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            }
            case 'last-month': {
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                startDate = lastMonth;
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            }
            case 'this-year': {
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            }
            case 'last-12-months': {
                startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            }
        }
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate };
    }
};
exports.IncomesService = IncomesService;
exports.IncomesService = IncomesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(income_entity_1.Income)),
    __param(1, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => expenses_service_1.ExpensesService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        expenses_service_1.ExpensesService,
        categories_service_1.CategoriesService])
], IncomesService);
//# sourceMappingURL=incomes.service.js.map