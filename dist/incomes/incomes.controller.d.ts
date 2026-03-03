import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
export declare class IncomesController {
    private readonly incomesService;
    constructor(incomesService: IncomesService);
    create(userId: string, createIncomeDto: CreateIncomeDto): Promise<{
        message: string;
        data: import("./income.entity").Income[];
    }>;
    getStats(userId: string, period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months', startDate?: string, endDate?: string): Promise<{
        data: {
            balance: number;
            balanceChange: number;
            income: number;
            incomeChange: number;
            expense: number;
            expenseChange: number;
        };
    }>;
    findAll(userId: string, period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months'): Promise<{
        data: import("./income.entity").Income[];
    }>;
    getLatestTransactions(userId: string, limit?: string): Promise<{
        data: {
            id: string;
            description: string;
            categoryIcon: string;
            category: string;
            date: string;
            purchaseDate?: string | null;
            amount: number;
            type: "income" | "expense";
            is_paid?: boolean;
        }[];
    }>;
    getTransactions(userId: string, startDate?: string, endDate?: string, category?: string, minAmount?: string, maxAmount?: string, description?: string, period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months', month?: string, year?: string, type?: 'income' | 'expense'): Promise<{
        data: {
            id: string;
            description: string;
            categoryIcon: string;
            category: string;
            date: string;
            purchaseDate?: string | null;
            amount: number;
            type: "income" | "expense";
            is_paid?: boolean;
        }[];
    }>;
    findOne(id: string, userId: string): Promise<{
        data: import("./income.entity").Income;
    }>;
    update(id: string, userId: string, updateIncomeDto: UpdateIncomeDto): Promise<{
        message: string;
        data: import("./income.entity").Income;
    }>;
    remove(id: string, userId: string): Promise<void>;
    findByCategory(category: string, userId: string): Promise<{
        data: import("./income.entity").Income[];
    }>;
}
