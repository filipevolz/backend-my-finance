import { ConfigService } from '@nestjs/config';
import { IAssetProvider } from './external-assets.service';
import { ExternalAssetData } from '../mappers/asset.mapper';
export declare class BrapiProvider implements IAssetProvider {
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    searchAssets(search?: string, group?: string, limit?: number, offset?: number): Promise<ExternalAssetData[]>;
    private searchUSStocks;
    private searchBDRs;
    private fetchAssetInfo;
    private getPopularTickers;
    getAllAvailableTickers(): Promise<string[]>;
}
