import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CategoriesService } from '../categories/categories.service';
import { CardsService } from '../cards/cards.service';
export declare class ExpensesService {
    private expensesRepository;
    private categoriesService;
    private cardsService;
    private configService;
    constructor(expensesRepository: Repository<Expense>, categoriesService: CategoriesService, cardsService: CardsService, configService: ConfigService);
    create(userId: string, createExpenseDto: CreateExpenseDto): Promise<Expense>;
    findAll(userId: string): Promise<Expense[]>;
    findOne(id: string, userId: string): Promise<Expense>;
    update(id: string, userId: string, updateExpenseDto: UpdateExpenseDto, updateGroup?: boolean): Promise<Expense>;
    findByGroupId(groupId: string, userId: string): Promise<Expense[]>;
    remove(id: string, userId: string): Promise<void>;
    removeGroup(groupId: string, userId: string): Promise<void>;
    findByCategory(userId: string, category: string): Promise<Expense[]>;
    findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Expense[]>;
    findByPeriod(userId: string, period: 'this-month' | 'last-month' | 'this-year' | 'last-12-months'): Promise<Expense[]>;
    getStats(userId: string, period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months', startDate?: Date, endDate?: Date): Promise<number>;
    getByCategory(userId: string, period?: 'this-month' | 'last-month' | 'this-year' | 'last-12-months', startDate?: Date, endDate?: Date): Promise<Array<{
        name: string;
        percentage: number;
        color: string;
        icon: string | null;
        value: number;
    }>>;
    importFromPdf(userId: string, file: Express.Multer.File, cardId?: string | null): Promise<{
        data: Expense[];
        errors?: string[];
    }>;
    private findDuplicateExpenseForImport;
}
