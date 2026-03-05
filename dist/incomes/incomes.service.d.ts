import { Repository } from 'typeorm';
import { Income } from './income.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { ExpensesService } from '../expenses/expenses.service';
import { Expense } from '../expenses/expense.entity';
import { CategoriesService } from '../categories/categories.service';
export declare class IncomesService {
    private incomesRepository;
    private expensesRepository;
    private expensesService;
    private categoriesService;
    constructor(incomesRepository: Repository<Income>, expensesRepository: Repository<Expense>, expensesService: ExpensesService, categoriesService: CategoriesService);
    private normalizeText;
    private dateOnlyToString;
    create(userId: string, createIncomeDto: CreateIncomeDto): Promise<Income[]>;
    findAll(userId: string): Promise<Income[]>;
    findOne(id: string, userId: string): Promise<Income>;
    update(id: string, userId: string, updateIncomeDto: UpdateIncomeDto): Promise<Income>;
    remove(id: string, userId: string): Promise<void>;
    findByCategory(userId: string, category: string): Promise<Income[]>;
    findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Income[]>;
    findByPeriod(userId: string, period: 'this-month' | 'last-month' | 'this-year' | 'last-12-months'): Promise<Income[]>;
    getStats(userId: string, period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months', startDate?: Date, endDate?: Date): Promise<{
        balance: number;
        balanceChange: number;
        income: number;
        incomeChange: number;
        expense: number;
        expenseChange: number;
    }>;
    getLatestTransactions(userId: string, limit?: number): Promise<Array<{
        id: string;
        description: string;
        categoryIcon: string;
        category: string;
        date: string;
        purchaseDate?: string | null;
        amount: number;
        type: 'income' | 'expense';
        is_paid?: boolean;
    }>>;
    getTransactions(userId: string, filters: {
        startDate?: Date;
        endDate?: Date;
        category?: string;
        minAmount?: number;
        maxAmount?: number;
        description?: string;
        period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months';
        month?: number;
        year?: number;
        type?: 'income' | 'expense';
    }): Promise<Array<{
        id: string;
        description: string;
        categoryIcon: string;
        category: string;
        date: string;
        purchaseDate?: string | null;
        amount: number;
        type: 'income' | 'expense';
        is_paid?: boolean;
    }>>;
    private getPeriodDates;
}
