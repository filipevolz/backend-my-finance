import { InvestmentsService } from './investments.service';
import { CreateInvestmentOperationDto } from './dto/create-investment-operation.dto';
import { UpdateInvestmentOperationDto } from './dto/update-investment-operation.dto';
import { ExternalAssetsService } from './services/external-assets.service';
import { AssetSyncService } from './services/asset-sync.service';
import { BrazilianStocksFetcherService } from './services/brazilian-stocks-fetcher.service';
export declare class InvestmentsController {
    private readonly investmentsService;
    private readonly externalAssetsService;
    private readonly assetSyncService;
    private readonly brazilianStocksFetcher;
    constructor(investmentsService: InvestmentsService, externalAssetsService: ExternalAssetsService, assetSyncService: AssetSyncService, brazilianStocksFetcher: BrazilianStocksFetcherService);
    create(userId: string, createDto: CreateInvestmentOperationDto): Promise<{
        message: string;
        data: import("./investment-operation.entity").InvestmentOperation;
    }>;
    findAll(userId: string): Promise<{
        data: import("./investment-operation.entity").InvestmentOperation[];
    }>;
    findOne(id: string, userId: string): Promise<{
        data: import("./investment-operation.entity").InvestmentOperation;
    }>;
    update(id: string, userId: string, updateDto: UpdateInvestmentOperationDto): Promise<{
        message: string;
        data: import("./investment-operation.entity").InvestmentOperation;
    }>;
    remove(id: string, userId: string): Promise<void>;
    getCurrentPosition(userId: string): Promise<{
        data: {
            asset: string;
            assetClass: string;
            quantity: number;
            averagePrice: number;
            currentValue: number;
            totalInvested: number;
            profit: number;
            profitPercentage: number;
            portfolioPercentage: number;
            broker: string | null;
            currency: string;
            averageHoldingTime: number;
        }[];
    }>;
    getMonthlyEvolution(userId: string): Promise<{
        data: {
            month: string;
            portfolioValue: number;
            contributions: number;
            withdrawals: number;
            dividends: number;
            returns: number;
            cumulativeContributions: number;
            cumulativeDividends: number;
        }[];
    }>;
    getOperationsByAsset(asset: string, userId: string): Promise<{
        data: import("./investment-operation.entity").InvestmentOperation[];
    }>;
    getOperationsByMonth(month: string, userId: string): Promise<{
        data: import("./investment-operation.entity").InvestmentOperation[];
    }>;
    getAssetTypes(): Promise<{
        data: import("./asset-type.entity").AssetType[];
    }>;
    getExchanges(): Promise<{
        data: import("./exchange.entity").Exchange[];
    }>;
    searchAssets(search?: string, assetGroup?: string, limit?: string, assetSearch?: string, group?: string, offset?: string): Promise<import("./mappers/asset.mapper").MyProfitAssetFormat[] | {
        data: any[];
    }>;
    syncAssets(group?: string): Promise<{
        message: string;
        synced: number;
    }>;
    syncAssetsFromExternal(group?: string, limit?: string): Promise<{
        message: string;
        synced: number;
    }>;
    syncAssetsBySearch(search: string, group?: string): Promise<{
        message: string;
        synced: number;
    }>;
    getAssetByTicker(ticker: string): Promise<{
        data: any;
    }>;
    getAssetsMyProfitFormat(assetSearch?: string, group?: string, limit?: string, offset?: string): Promise<import("./mappers/asset.mapper").MyProfitAssetFormat[]>;
    syncAllBrazilianStocks(): Promise<{
        message: string;
        created: number;
        updated: number;
        total: number;
    }>;
}
