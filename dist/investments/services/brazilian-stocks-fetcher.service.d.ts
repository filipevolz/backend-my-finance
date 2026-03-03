import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Asset } from '../asset.entity';
interface StockData {
    ticker: string;
    assetName?: string;
    legalName?: string;
    sector?: string;
    subSector?: string;
    segment?: string;
    cnpj?: string;
    assetType?: string;
    pic?: string;
}
export declare class BrazilianStocksFetcherService {
    private readonly assetRepository;
    private readonly configService;
    private readonly logger;
    constructor(assetRepository: Repository<Asset>, configService: ConfigService);
    fetchAllBrazilianTickers(): Promise<string[]>;
    private fetchTickersFromBrapi;
    private fetchTickersFromYahooFinance;
    private getKnownBrazilianTickers;
    enrichStockData(ticker: string): Promise<StockData | null>;
    private fetchFromBrapi;
    private fetchFromAlphaVantage;
    private extractAssetType;
    syncAllBrazilianStocks(): Promise<{
        created: number;
        updated: number;
    }>;
    private delay;
}
export {};
