export declare class User {
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    plan: 'free' | 'pro' | 'premium';
    createdAt: Date;
    updatedAt: Date;
}
