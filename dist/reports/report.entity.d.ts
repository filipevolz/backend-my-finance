import { User } from '../users/user.entity';
export type ReportPeriodType = 'from-start-to-today' | 'all-records';
export declare class Report {
    id: string;
    userId: string;
    user: User;
    content: string;
    periodStart: Date;
    periodEnd: Date;
    periodType: ReportPeriodType;
    periodKey: string;
    createdAt: Date;
}
