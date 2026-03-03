export interface ExternalAssetData {
    ticker?: string;
    name?: string;
    companyName?: string;
    sector?: string;
    subsector?: string;
    segment?: string;
    cnpj?: string;
    market?: string;
    logo?: string;
    [key: string]: any;
}
export interface MyProfitAssetFormat {
    ID: number;
    AssetName: string;
    Ticker: string;
    Alias: string;
    TickerRef: string;
    Pic: string | null;
    Sector: string | null;
    SubSector: string | null;
    TypeTax: string | null;
    DueDate: string | null;
    Index: string | null;
    Tax: number;
    Segment: string | null;
    AssetType: string | null;
    CNPJ: string | null;
    CNPJAdmin: string | null;
    Administrator: string | null;
    LegalName: string | null;
    CodeAPI: number | null;
    Exceptions: string | null;
    Market: number;
    MarketString: string | null;
    Category: string | null;
    Exemption: boolean;
    AssetGroup: string;
    AssetSeries: string | null;
}
export declare class AssetMapper {
    static toMyProfitFormat(externalData: ExternalAssetData, assetGroup?: string, id?: number): MyProfitAssetFormat;
    static extractAssetType(ticker: string): string | null;
    static applyAssetType(asset: MyProfitAssetFormat): MyProfitAssetFormat;
    static mapArray(externalDataArray: ExternalAssetData[], assetGroup?: string, startId?: number): MyProfitAssetFormat[];
}
