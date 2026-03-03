export declare class EmailService {
    private transporter;
    constructor();
    sendPasswordResetEmail(email: string, resetUrl: string): Promise<void>;
}
