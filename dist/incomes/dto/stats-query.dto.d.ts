export declare enum Period {
    THIS_MONTH = "this-month",
    LAST_MONTH = "last-month",
    THIS_YEAR = "this-year",
    LAST_12_MONTHS = "last-12-months"
}
export declare class StatsQueryDto {
    period?: Period;
}
