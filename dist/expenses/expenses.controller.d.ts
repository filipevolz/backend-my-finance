import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    importFromPdf(userId: string, file: Express.Multer.File, cardId?: string | null): Promise<{
        message: string;
        data: import("./expense.entity").Expense[];
        errors: string[] | undefined;
    }>;
    create(userId: string, createExpenseDto: CreateExpenseDto): Promise<{
        message: string;
        data: import("./expense.entity").Expense;
    }>;
    findAll(userId: string, period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months'): Promise<{
        data: import("./expense.entity").Expense[];
    }>;
    findOne(id: string, userId: string): Promise<{
        data: import("./expense.entity").Expense;
    }>;
    update(id: string, userId: string, updateExpenseDto: UpdateExpenseDto, updateGroup?: string): Promise<{
        message: string;
        data: import("./expense.entity").Expense;
    }>;
    remove(id: string, userId: string): Promise<void>;
    findByGroupId(groupId: string, userId: string): Promise<{
        data: import("./expense.entity").Expense[];
    }>;
    removeGroup(groupId: string, userId: string): Promise<void>;
    findByCategory(category: string, userId: string): Promise<{
        data: import("./expense.entity").Expense[];
    }>;
    getByCategory(userId: string, period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months', startDate?: string, endDate?: string): Promise<{
        data: {
            name: string;
            percentage: number;
            color: string;
            icon: string | null;
            value: number;
        }[];
    }>;
}
