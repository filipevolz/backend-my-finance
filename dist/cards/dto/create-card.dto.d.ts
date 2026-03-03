export declare class CreateCardDto {
    nickname: string;
    lastFourDigits?: string | null;
    dueDate: number;
    totalLimit: number;
    closingDate: number;
    isDefault?: boolean;
}
