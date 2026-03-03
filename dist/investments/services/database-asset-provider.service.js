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
var DatabaseAssetProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseAssetProvider = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const asset_entity_1 = require("../asset.entity");
let DatabaseAssetProvider = DatabaseAssetProvider_1 = class DatabaseAssetProvider {
    assetRepository;
    logger = new common_1.Logger(DatabaseAssetProvider_1.name);
    constructor(assetRepository) {
        this.assetRepository = assetRepository;
    }
    async searchAssets(search, group, limit = 50, offset = 0) {
        try {
            const query = this.assetRepository.createQueryBuilder('asset');
            if (group) {
                query.where('asset.assetGroup = :group', { group });
            }
            if (search) {
                const searchLower = search.toLowerCase();
                query.andWhere('(LOWER(asset.ticker) LIKE :search OR LOWER(asset.assetName) LIKE :search)', { search: `%${searchLower}%` });
            }
            query
                .orderBy('asset.assetName', 'ASC')
                .skip(offset)
                .take(limit);
            const assets = await query.getMany();
            return assets.map((asset) => ({
                ticker: asset.ticker,
                name: asset.assetName,
                companyName: asset.legalName || asset.assetName,
                sector: asset.sector || undefined,
                subsector: asset.subSector || undefined,
                segment: asset.segment || undefined,
                cnpj: asset.cnpj || undefined,
                market: asset.marketString || 'Bovespa',
                assetType: asset.assetType || undefined,
            }));
        }
        catch (error) {
            this.logger.error(`Erro ao buscar assets do banco: ${error.message}`);
            return [];
        }
    }
};
exports.DatabaseAssetProvider = DatabaseAssetProvider;
exports.DatabaseAssetProvider = DatabaseAssetProvider = DatabaseAssetProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DatabaseAssetProvider);
//# sourceMappingURL=database-asset-provider.service.js.map