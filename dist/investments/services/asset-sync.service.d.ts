import { Repository } from 'typeorm';
import { Asset } from '../asset.entity';
import { ExternalAssetsService } from './external-assets.service';
export declare class AssetSyncService {
    private readonly assetRepository;
    private readonly externalAssetsService;
    private readonly logger;
    constructor(assetRepository: Repository<Asset>, externalAssetsService: ExternalAssetsService);
    syncAssetsFromExternalAPI(group?: string, limit?: number): Promise<number>;
    syncAssetsBySearch(search: string, group?: string): Promise<number>;
}
