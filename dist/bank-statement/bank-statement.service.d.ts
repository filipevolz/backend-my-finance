import { ExpensesService } from '../expenses/expenses.service';
import { IncomesService } from '../incomes/incomes.service';
export declare class BankStatementService {
    private readonly expensesService;
    private readonly incomesService;
    constructor(expensesService: ExpensesService, incomesService: IncomesService);
    importFromPdf(userId: string, file: Express.Multer.File): Promise<{
        expensesCreated: number;
        incomesCreated: number;
        errors: string[];
    }>;
    private parseItauExtractText;
    private parseBrlValue;
}
