import { User } from '../users/user.entity';
export declare class Income {
    id: string;
    user: User;
    userId: string;
    name: string | null;
    category: string;
    amount: number;
    date: Date;
    isRecurring: boolean;
    recurringGroupId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
