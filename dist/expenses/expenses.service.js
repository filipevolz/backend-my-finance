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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const expense_entity_1 = require("./expense.entity");
const categories_service_1 = require("../categories/categories.service");
const category_entity_1 = require("../categories/category.entity");
const cards_service_1 = require("../cards/cards.service");
let ExpensesService = class ExpensesService {
    expensesRepository;
    categoriesService;
    cardsService;
    constructor(expensesRepository, categoriesService, cardsService) {
        this.expensesRepository = expensesRepository;
        this.categoriesService = categoriesService;
        this.cardsService = cardsService;
    }
    async create(userId, createExpenseDto) {
        const dateStr = createExpenseDto.date.split('T')[0];
        const [year, month, day] = dateStr.split('-').map(Number);
        const purchaseDate = new Date(year, month - 1, day);
        const installments = createExpenseDto.installments || 1;
        const isParceled = installments > 1 && createExpenseDto.cardId;
        let card = null;
        if (createExpenseDto.cardId) {
            card = await this.cardsService.findOne(createExpenseDto.cardId, userId);
            await this.cardsService.recalculateUsedLimit(createExpenseDto.cardId, userId);
            const updatedCard = await this.cardsService.findOne(createExpenseDto.cardId, userId);
            const availableLimit = (updatedCard.totalLimit ?? 0) - (updatedCard.usedLimit ?? 0);
            if (availableLimit < createExpenseDto.amount) {
                throw new common_1.BadRequestException('Limite disponível do cartão insuficiente');
            }
        }
        if (isParceled && createExpenseDto.cardId && card) {
            const groupId = (0, crypto_1.randomUUID)();
            const installmentAmount = Math.floor(createExpenseDto.amount / installments);
            const lastInstallmentAmount = createExpenseDto.amount - installmentAmount * (installments - 1);
            const expenses = [];
            const purchaseDay = purchaseDate.getDate();
            const purchaseMonth = purchaseDate.getMonth();
            const purchaseYear = purchaseDate.getFullYear();
            let firstInstallmentMonth = purchaseMonth;
            let firstInstallmentYear = purchaseYear;
            if (purchaseDay > card.closingDate) {
                firstInstallmentMonth = purchaseMonth + 1;
                if (firstInstallmentMonth > 11) {
                    firstInstallmentMonth = 0;
                    firstInstallmentYear = purchaseYear + 1;
                }
            }
            for (let i = 0; i < installments; i++) {
                let installmentMonth = firstInstallmentMonth + i;
                let installmentYear = firstInstallmentYear;
                while (installmentMonth > 11) {
                    installmentMonth -= 12;
                    installmentYear += 1;
                }
                const dueDate = new Date(installmentYear, installmentMonth, card.dueDate);
                const amount = i === installments - 1 ? lastInstallmentAmount : installmentAmount;
                const expense = this.expensesRepository.create({
                    userId,
                    name: createExpenseDto.name
                        ? `${createExpenseDto.name} (${i + 1}/${installments})`
                        : null,
                    category: createExpenseDto.category,
                    amount,
                    date: dueDate,
                    purchaseDate: purchaseDate,
                    is_paid: false,
                    cardId: createExpenseDto.cardId,
                    installments,
                    installmentNumber: i + 1,
                    groupId,
                });
                expenses.push(expense);
            }
            const savedExpenses = await this.expensesRepository.save(expenses);
            if (createExpenseDto.cardId) {
                await this.cardsService.recalculateUsedLimit(createExpenseDto.cardId, userId);
            }
            return savedExpenses[0];
        }
        let expenseDate = purchaseDate;
        let expensePurchaseDate = null;
        if (createExpenseDto.cardId && card) {
            const purchaseDay = purchaseDate.getDate();
            const purchaseMonth = purchaseDate.getMonth();
            const purchaseYear = purchaseDate.getFullYear();
            let dueMonth = purchaseMonth;
            let dueYear = purchaseYear;
            if (purchaseDay > card.closingDate) {
                dueMonth = purchaseMonth + 1;
                if (dueMonth > 11) {
                    dueMonth = 0;
                    dueYear = purchaseYear + 1;
                }
            }
            expenseDate = new Date(dueYear, dueMonth, card.dueDate);
            expensePurchaseDate = purchaseDate;
        }
        const expense = this.expensesRepository.create({
            userId,
            name: createExpenseDto.name || null,
            category: createExpenseDto.category,
            amount: createExpenseDto.amount,
            date: expenseDate,
            purchaseDate: expensePurchaseDate,
            is_paid: createExpenseDto.is_paid ?? false,
            cardId: createExpenseDto.cardId || null,
            installments: installments > 1 ? installments : null,
            installmentNumber: null,
        });
        const savedExpense = await this.expensesRepository.save(expense);
        if (createExpenseDto.cardId) {
            await this.cardsService.recalculateUsedLimit(createExpenseDto.cardId, userId);
        }
        return savedExpense;
    }
    async findAll(userId) {
        return await this.expensesRepository.find({
            where: { userId },
            order: { date: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const expense = await this.expensesRepository.findOne({
            where: { id },
        });
        if (!expense) {
            throw new common_1.NotFoundException('Despesa não encontrada');
        }
        if (expense.userId !== userId) {
            throw new common_1.ForbiddenException('Você não tem permissão para acessar esta despesa');
        }
        return expense;
    }
    async update(id, userId, updateExpenseDto, updateGroup) {
        const expense = await this.findOne(id, userId);
        if (updateGroup && expense.groupId) {
            const groupExpenses = await this.findByGroupId(expense.groupId, userId);
            for (const groupExpense of groupExpenses) {
                Object.assign(groupExpense, updateExpenseDto);
                if (updateExpenseDto.date) {
                    const dateStr = updateExpenseDto.date.split('T')[0];
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const baseDate = new Date(year, month - 1, day);
                    if (groupExpense.installments && groupExpense.installmentNumber) {
                    }
                    else {
                        groupExpense.date = baseDate;
                    }
                }
                await this.expensesRepository.save(groupExpense);
            }
            return expense;
        }
        const oldCardId = expense.cardId;
        const oldAmount = expense.amount;
        let newCardId;
        if (updateExpenseDto.hasOwnProperty('cardId')) {
            newCardId = updateExpenseDto.cardId ?? null;
        }
        else {
            newCardId = expense.cardId;
        }
        const newAmount = updateExpenseDto.amount !== undefined
            ? updateExpenseDto.amount
            : expense.amount;
        const oldCardIdNormalized = oldCardId ?? null;
        const newCardIdNormalized = newCardId ?? null;
        const cardChanged = oldCardIdNormalized !== newCardIdNormalized;
        const amountChanged = oldAmount !== newAmount;
        if (cardChanged || amountChanged) {
            if (newCardIdNormalized) {
                const newCard = await this.cardsService.findOne(newCardIdNormalized, userId);
                await this.cardsService.recalculateUsedLimit(newCardIdNormalized, userId);
                const updatedCard = await this.cardsService.findOne(newCardIdNormalized, userId);
                const availableLimit = (updatedCard.totalLimit ?? 0) - (updatedCard.usedLimit ?? 0);
                if (availableLimit < newAmount) {
                    throw new common_1.BadRequestException('Limite disponível do cartão insuficiente');
                }
            }
        }
        Object.assign(expense, updateExpenseDto);
        if (updateExpenseDto.date || cardChanged) {
            const dateStr = (updateExpenseDto.date || expense.date.toISOString().split('T')[0]).split('T')[0];
            const [year, month, day] = dateStr.split('-').map(Number);
            const purchaseDate = new Date(year, month - 1, day);
            if (newCardIdNormalized) {
                const card = await this.cardsService.findOne(newCardIdNormalized, userId);
                const purchaseDay = purchaseDate.getDate();
                const purchaseMonth = purchaseDate.getMonth();
                const purchaseYear = purchaseDate.getFullYear();
                let dueMonth = purchaseMonth;
                let dueYear = purchaseYear;
                if (purchaseDay > card.closingDate) {
                    dueMonth = purchaseMonth + 1;
                    if (dueMonth > 11) {
                        dueMonth = 0;
                        dueYear = purchaseYear + 1;
                    }
                }
                expense.date = new Date(dueYear, dueMonth, card.dueDate);
                expense.purchaseDate = purchaseDate;
            }
            else {
                expense.date = purchaseDate;
                expense.purchaseDate = null;
            }
        }
        const savedExpense = await this.expensesRepository.save(expense);
        if (cardChanged || amountChanged) {
            if (oldCardIdNormalized && oldCardIdNormalized !== newCardIdNormalized) {
                await this.cardsService.recalculateUsedLimit(oldCardIdNormalized, userId);
            }
            if (newCardIdNormalized) {
                await this.cardsService.recalculateUsedLimit(newCardIdNormalized, userId);
            }
        }
        return savedExpense;
    }
    async findByGroupId(groupId, userId) {
        return await this.expensesRepository.find({
            where: { groupId, userId },
            order: { installmentNumber: 'ASC' },
        });
    }
    async remove(id, userId) {
        const expense = await this.findOne(id, userId);
        const cardId = expense.cardId;
        await this.expensesRepository.remove(expense);
        if (cardId) {
            await this.cardsService.recalculateUsedLimit(cardId, userId);
        }
    }
    async removeGroup(groupId, userId) {
        const expenses = await this.findByGroupId(groupId, userId);
        if (expenses.length === 0) {
            throw new common_1.NotFoundException('Grupo de despesas não encontrado');
        }
        const cardId = expenses[0].cardId;
        await this.expensesRepository.remove(expenses);
        if (cardId) {
            await this.cardsService.recalculateUsedLimit(cardId, userId);
        }
    }
    async findByCategory(userId, category) {
        return await this.expensesRepository.find({
            where: { userId, category },
            order: { date: 'DESC' },
        });
    }
    async findByDateRange(userId, startDate, endDate) {
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
        let currentExpenses;
        if (startDate && endDate) {
            currentExpenses = await this.findByDateRange(userId, startDate, endDate);
        }
        else if (period) {
            currentExpenses = await this.findByPeriod(userId, period);
        }
        else {
            currentExpenses = await this.findAll(userId);
        }
        const currentExpense = currentExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        return currentExpense;
    }
    async getByCategory(userId, period, startDate, endDate) {
        let expenses;
        if (startDate && endDate) {
            expenses = await this.findByDateRange(userId, startDate, endDate);
        }
        else if (period) {
            expenses = await this.findByPeriod(userId, period);
        }
        else {
            expenses = await this.findAll(userId);
        }
        const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        const categoryMap = new Map();
        for (const expense of expenses) {
            const existing = categoryMap.get(expense.category);
            if (existing) {
                existing.amount += Number(expense.amount);
            }
            else {
                categoryMap.set(expense.category, {
                    amount: Number(expense.amount),
                    icon: null,
                });
            }
        }
        const categories = await this.categoriesService.findAll(category_entity_1.CategoryType.EXPENSE);
        const categoryInfoMap = new Map(categories.map((cat) => [cat.name, { icon: cat.icon, color: '' }]));
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
        const result = Array.from(categoryMap.entries())
            .map(([name, data], index) => {
            const categoryInfo = categoryInfoMap.get(name);
            const percentage = totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0;
            return {
                name,
                percentage: Math.round(percentage * 100) / 100,
                color: colors[index % colors.length],
                icon: categoryInfo?.icon || null,
                value: data.amount,
            };
        })
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
        return result;
    }
    async getByCategoryWithMonthCount(userId, period, startDate, endDate) {
        let expenses;
        if (startDate && endDate) {
            expenses = await this.findByDateRange(userId, startDate, endDate);
        }
        else if (period) {
            expenses = await this.findByPeriod(userId, period);
        }
        else {
            expenses = await this.findAll(userId);
        }
        const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        const categoryMap = new Map();
        for (const expense of expenses) {
            const d = expense.date instanceof Date ? expense.date : new Date(expense.date);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const existing = categoryMap.get(expense.category);
            if (existing) {
                existing.amount += Number(expense.amount);
                existing.monthKeys.add(monthKey);
            }
            else {
                categoryMap.set(expense.category, {
                    amount: Number(expense.amount),
                    monthKeys: new Set([monthKey]),
                });
            }
        }
        return Array.from(categoryMap.entries())
            .map(([name, data]) => {
            const monthsWithExpenses = Math.max(1, data.monthKeys.size);
            const percentage = totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0;
            return {
                name,
                value: data.amount,
                percentage: Math.round(percentage * 100) / 100,
                monthsWithExpenses,
            };
        })
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        categories_service_1.CategoriesService,
        cards_service_1.CardsService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map