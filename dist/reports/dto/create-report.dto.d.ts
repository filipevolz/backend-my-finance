export type ReportPeriod = 'from-start-to-today' | 'all-records';
export declare class CreateReportDto {
    period: ReportPeriod;
}
