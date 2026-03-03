import { OnModuleInit } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
export declare class InvestmentsModule implements OnModuleInit {
    private readonly investmentsService;
    constructor(investmentsService: InvestmentsService);
    onModuleInit(): Promise<void>;
}
