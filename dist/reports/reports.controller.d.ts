import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    findAll(userId: string): Promise<{
        data: import("./report.entity").Report[];
    }>;
    findOne(id: string, userId: string): Promise<{
        data: import("./report.entity").Report;
    }>;
    create(userId: string, createReportDto: CreateReportDto): Promise<{
        message: string;
        data: import("./report.entity").Report;
    }>;
}
