import { User } from '../users/user.entity';
export declare enum OperationType {
    BUY = "buy",
    SELL = "sell",
    DIVIDEND = "dividend",
    INTEREST = "interest",
    STOCK_SPLIT = "stock_split"
}
export declare enum AssetClass {
    STOCK = "stock",
    BOND = "bond",
    FUND = "fund",
    ETF = "etf",
    CRYPTO = "crypto",
    REAL_ESTATE = "real_estate",
    CASH = "cash",
    OTHER = "other"
}
export declare class InvestmentOperation {
    id: string;
    user: User;
    userId: string;
    asset: string;
    assetClass: string;
    type: OperationType;
    date: Date;
    quantity: number;
    price: number;
    totalAmount: number;
    currency: string;
    broker: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
