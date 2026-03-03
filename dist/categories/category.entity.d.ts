export declare enum CategoryType {
    INCOME = "income",
    EXPENSE = "expense"
}
export declare class Category {
    id: string;
    name: string;
    type: CategoryType;
    icon: string | null;
    createdAt: Date;
    updatedAt: Date;
}
