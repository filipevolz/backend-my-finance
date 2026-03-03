import { User } from '../users/user.entity';
import { Card } from '../cards/card.entity';
export declare class Expense {
    id: string;
    user: User;
    userId: string;
    name: string | null;
    category: string;
    amount: number;
    date: Date;
    purchaseDate: Date | null;
    is_paid: boolean;
    card: Card | null;
    cardId: string | null;
    installments: number | null;
    installmentNumber: number | null;
    groupId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
