import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Report } from './report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UsersService } from '../users/users.service';
import { IncomesService } from '../incomes/incomes.service';
import { ExpensesService } from '../expenses/expenses.service';
export declare class ReportsService {
    private reportsRepository;
    private usersService;
    private incomesService;
    private expensesService;
    private configService;
    private openai;
    constructor(reportsRepository: Repository<Report>, usersService: UsersService, incomesService: IncomesService, expensesService: ExpensesService, configService: ConfigService);
    getPeriodKey(period: CreateReportDto['period']): string;
    getDateRange(userId: string, period: CreateReportDto['period']): Promise<{
        startDate: Date;
        endDate: Date;
        useAllRecords: boolean;
    }>;
    findAll(userId: string): Promise<Report[]>;
    findOne(id: string, userId: string): Promise<Report>;
    generate(userId: string, createReportDto: CreateReportDto): Promise<Report>;
}
