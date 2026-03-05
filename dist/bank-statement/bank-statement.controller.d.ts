import { BankStatementService } from './bank-statement.service';
export declare class BankStatementController {
    private readonly bankStatementService;
    constructor(bankStatementService: BankStatementService);
    importFromPdf(userId: string, file: Express.Multer.File): Promise<{
        message: string;
        data: {
            expensesCreated: number;
            incomesCreated: number;
            errors: string[] | undefined;
        };
    }>;
}
