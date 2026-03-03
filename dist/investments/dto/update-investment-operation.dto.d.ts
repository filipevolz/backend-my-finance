import { OperationType } from '../investment-operation.entity';
export declare class UpdateInvestmentOperationDto {
    asset?: string;
    assetClass?: string;
    type?: OperationType;
    date?: string;
    quantity?: number;
    price?: number;
    currency?: string;
    broker?: string;
    notes?: string;
}
