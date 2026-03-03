"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AssetSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetSyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const asset_entity_1 = require("../asset.entity");
const external_assets_service_1 = require("./external-assets.service");
let AssetSyncService = AssetSyncService_1 = class AssetSyncService {
    assetRepository;
    externalAssetsService;
    logger = new common_1.Logger(AssetSyncService_1.name);
    constructor(assetRepository, externalAssetsService) {
        this.assetRepository = assetRepository;
        this.externalAssetsService = externalAssetsService;
    }
    async syncAssetsFromExternalAPI(group = 'STOCK', limit = 100) {
        try {
            this.logger.log(`Iniciando sincronização de assets do grupo: ${group}`);
            let totalSynced = 0;
            let offset = 0;
            let hasMore = true;
            while (hasMore) {
                const assets = await this.externalAssetsService.searchAssets(undefined, group, limit, offset);
                if (assets.length === 0) {
                    hasMore = false;
                    break;
                }
                for (const myProfitAsset of assets) {
                    const ticker = myProfitAsset.Ticker?.trim();
                    if (!ticker) {
                        continue;
                    }
                    const existing = await this.assetRepository.findOne({
                        where: { ticker },
                    });
                    if (existing) {
                        existing.assetName = myProfitAsset.AssetName || existing.assetName;
                        existing.alias = myProfitAsset.Alias || ticker;
                        existing.pic = myProfitAsset.Pic || existing.pic;
                        existing.sector = myProfitAsset.Sector || existing.sector;
                        existing.subSector = myProfitAsset.SubSector || existing.subSector;
                        existing.segment = myProfitAsset.Segment || existing.segment;
                        existing.assetType = myProfitAsset.AssetType || existing.assetType;
                        existing.cnpj = myProfitAsset.CNPJ || existing.cnpj;
                        existing.legalName = myProfitAsset.LegalName || existing.legalName;
                        existing.marketString = myProfitAsset.MarketString || existing.marketString;
                        existing.category = myProfitAsset.Category || existing.category;
                        existing.assetGroup = myProfitAsset.AssetGroup || existing.assetGroup;
                        await this.assetRepository.save(existing);
                        this.logger.debug(`Asset atualizado: ${ticker}`);
                    }
                    else {
                        const asset = this.assetRepository.create({
                            assetName: myProfitAsset.AssetName || ticker,
                            ticker,
                            alias: myProfitAsset.Alias || ticker,
                            tickerRef: myProfitAsset.TickerRef || null,
                            pic: myProfitAsset.Pic || null,
                            sector: myProfitAsset.Sector || null,
                            subSector: myProfitAsset.SubSector || null,
                            typeTax: myProfitAsset.TypeTax || null,
                            dueDate: myProfitAsset.DueDate
                                ? new Date(myProfitAsset.DueDate)
                                : null,
                            index: myProfitAsset.Index || null,
                            tax: myProfitAsset.Tax || 0,
                            segment: myProfitAsset.Segment || null,
                            assetType: myProfitAsset.AssetType || null,
                            cnpj: myProfitAsset.CNPJ || null,
                            cnpjAdmin: myProfitAsset.CNPJAdmin || null,
                            administrator: myProfitAsset.Administrator || null,
                            legalName: myProfitAsset.LegalName || null,
                            codeAPI: myProfitAsset.CodeAPI || null,
                            exceptions: myProfitAsset.Exceptions || null,
                            market: myProfitAsset.Market || 0,
                            marketString: myProfitAsset.MarketString || 'Bovespa',
                            category: myProfitAsset.Category || null,
                            exemption: myProfitAsset.Exemption || false,
                            assetGroup: myProfitAsset.AssetGroup || group,
                            assetSeries: myProfitAsset.AssetSeries || null,
                        });
                        await this.assetRepository.save(asset);
                        totalSynced++;
                        this.logger.debug(`Novo asset criado: ${ticker}`);
                    }
                }
                if (assets.length < limit) {
                    hasMore = false;
                }
                else {
                    offset += limit;
                }
                this.logger.log(`Sincronizados ${totalSynced} assets até agora (offset: ${offset})`);
            }
            this.logger.log(`Sincronização concluída. Total de novos assets: ${totalSynced}`);
            return totalSynced;
        }
        catch (error) {
            this.logger.error(`Erro ao sincronizar assets: ${error.message}`, error.stack);
            throw error;
        }
    }
    async syncAssetsBySearch(search, group = 'STOCK') {
        try {
            this.logger.log(`Sincronizando assets com busca: ${search}`);
            const assets = await this.externalAssetsService.searchAssets(search, group, 100, 0);
            let synced = 0;
            for (const myProfitAsset of assets) {
                const ticker = myProfitAsset.Ticker?.trim();
                if (!ticker)
                    continue;
                const existing = await this.assetRepository.findOne({
                    where: { ticker },
                });
                if (!existing) {
                    const asset = this.assetRepository.create({
                        assetName: myProfitAsset.AssetName || ticker,
                        ticker,
                        alias: myProfitAsset.Alias || ticker,
                        sector: myProfitAsset.Sector || null,
                        subSector: myProfitAsset.SubSector || null,
                        segment: myProfitAsset.Segment || null,
                        assetType: myProfitAsset.AssetType || null,
                        cnpj: myProfitAsset.CNPJ || null,
                        legalName: myProfitAsset.LegalName || null,
                        marketString: myProfitAsset.MarketString || 'Bovespa',
                        category: myProfitAsset.Category || null,
                        assetGroup: myProfitAsset.AssetGroup || group,
                        tax: myProfitAsset.Tax || 0,
                        market: myProfitAsset.Market || 0,
                        exemption: myProfitAsset.Exemption || false,
                    });
                    await this.assetRepository.save(asset);
                    synced++;
                }
            }
            this.logger.log(`Sincronizados ${synced} novos assets`);
            return synced;
        }
        catch (error) {
            this.logger.error(`Erro ao sincronizar por busca: ${error.message}`);
            throw error;
        }
    }
};
exports.AssetSyncService = AssetSyncService;
exports.AssetSyncService = AssetSyncService = AssetSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        external_assets_service_1.ExternalAssetsService])
], AssetSyncService);
//# sourceMappingURL=asset-sync.service.js.map