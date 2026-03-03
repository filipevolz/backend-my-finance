import { Repository } from 'typeorm';
import { Asset } from '../asset.entity';
import { IAssetProvider } from './external-assets.service';
import { ExternalAssetData } from '../mappers/asset.mapper';
export declare class DatabaseAssetProvider implements IAssetProvider {
    private readonly assetRepository;
    private readonly logger;
    constructor(assetRepository: Repository<Asset>);
    searchAssets(search?: string, group?: string, limit?: number, offset?: number): Promise<ExternalAssetData[]>;
}
