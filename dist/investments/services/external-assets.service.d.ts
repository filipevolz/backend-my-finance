import { ConfigService } from '@nestjs/config';
import { ExternalAssetData, MyProfitAssetFormat } from '../mappers/asset.mapper';
import { DatabaseAssetProvider } from './database-asset-provider.service';
import { BrapiProvider } from './brapi-provider.service';
import { AlphaVantageProvider } from './alpha-vantage-provider.service';
export interface IAssetProvider {
    searchAssets(search?: string, group?: string, limit?: number, offset?: number): Promise<ExternalAssetData[]>;
}
export declare class DadosMercadoProvider implements IAssetProvider {
    private readonly logger;
    private readonly baseUrl;
    searchAssets(search?: string, group?: string, limit?: number, offset?: number): Promise<ExternalAssetData[]>;
}
export declare class B3Provider implements IAssetProvider {
    private readonly logger;
    private readonly baseUrl;
    searchAssets(search?: string, group?: string, limit?: number, offset?: number): Promise<ExternalAssetData[]>;
}
export declare class ExternalAssetsService {
    private readonly databaseProvider;
    private readonly dadosMercadoProvider;
    private readonly b3Provider;
    private readonly brapiProvider;
    private readonly alphaVantageProvider;
    private readonly configService;
    private readonly logger;
    private currentProvider;
    constructor(databaseProvider: DatabaseAssetProvider, dadosMercadoProvider: DadosMercadoProvider, b3Provider: B3Provider, brapiProvider: BrapiProvider, alphaVantageProvider: AlphaVantageProvider, configService: ConfigService);
    searchAssets(assetSearch?: string, group?: string, limit?: number, offset?: number): Promise<MyProfitAssetFormat[]>;
    setProvider(provider: IAssetProvider): void;
}
