export declare class User {
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
