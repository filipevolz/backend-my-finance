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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const investments_controller_1 = require("./investments.controller");
const investments_service_1 = require("./investments.service");
const investment_operation_entity_1 = require("./investment-operation.entity");
const asset_type_entity_1 = require("./asset-type.entity");
const exchange_entity_1 = require("./exchange.entity");
const asset_entity_1 = require("./asset.entity");
const asset_types_seed_1 = require("./asset-types.seed");
const exchanges_seed_1 = require("./exchanges.seed");
const assets_seed_1 = require("./assets.seed");
const external_assets_service_1 = require("./services/external-assets.service");
const database_asset_provider_service_1 = require("./services/database-asset-provider.service");
const brapi_provider_service_1 = require("./services/brapi-provider.service");
const alpha_vantage_provider_service_1 = require("./services/alpha-vantage-provider.service");
const asset_sync_service_1 = require("./services/asset-sync.service");
const brazilian_stocks_fetcher_service_1 = require("./services/brazilian-stocks-fetcher.service");
let InvestmentsModule = class InvestmentsModule {
    investmentsService;
    constructor(investmentsService) {
        this.investmentsService = investmentsService;
    }
    async onModuleInit() {
        const existingAssetTypes = await this.investmentsService.getAssetTypes();
        if (existingAssetTypes.length === 0) {
            await this.investmentsService.seedAssetTypes(asset_types_seed_1.assetTypesSeed);
        }
        try {
            const exchangesSeed = await (0, exchanges_seed_1.loadExchangesSeed)();
            if (exchangesSeed.length > 0) {
                await this.investmentsService.seedExchanges(exchangesSeed);
            }
        }
        catch (error) {
            console.error('⚠️ Erro ao popular exchanges:', error);
        }
        try {
            const assetsSeed = await (0, assets_seed_1.loadAssetsSeed)();
            if (assetsSeed.length > 0) {
                await this.investmentsService.seedAssets(assetsSeed);
            }
        }
        catch (error) {
            console.error('⚠️ Erro ao popular assets:', error);
        }
    }
};
exports.InvestmentsModule = InvestmentsModule;
exports.InvestmentsModule = InvestmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([investment_operation_entity_1.InvestmentOperation, asset_type_entity_1.AssetType, exchange_entity_1.Exchange, asset_entity_1.Asset])],
        controllers: [investments_controller_1.InvestmentsController],
        providers: [
            investments_service_1.InvestmentsService,
            external_assets_service_1.ExternalAssetsService,
            database_asset_provider_service_1.DatabaseAssetProvider,
            external_assets_service_1.DadosMercadoProvider,
            external_assets_service_1.B3Provider,
            brapi_provider_service_1.BrapiProvider,
            alpha_vantage_provider_service_1.AlphaVantageProvider,
            asset_sync_service_1.AssetSyncService,
            brazilian_stocks_fetcher_service_1.BrazilianStocksFetcherService,
        ],
        exports: [investments_service_1.InvestmentsService, external_assets_service_1.ExternalAssetsService],
    }),
    __metadata("design:paramtypes", [investments_service_1.InvestmentsService])
], InvestmentsModule);
//# sourceMappingURL=investments.module.js.map