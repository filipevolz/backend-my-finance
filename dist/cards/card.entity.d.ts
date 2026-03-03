import { User } from '../users/user.entity';
export declare class Card {
    id: string;
    user: User;
    userId: string;
    nickname: string;
    lastFourDigits: string | null;
    dueDate: number;
    totalLimit: number | null;
    usedLimit: number;
    availableLimit: number | null;
    get calculatedAvailableLimit(): number;
    closingDate: number;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
