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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const investments_service_1 = require("./investments.service");
const create_investment_operation_dto_1 = require("./dto/create-investment-operation.dto");
const update_investment_operation_dto_1 = require("./dto/update-investment-operation.dto");
const external_assets_service_1 = require("./services/external-assets.service");
const asset_sync_service_1 = require("./services/asset-sync.service");
const brazilian_stocks_fetcher_service_1 = require("./services/brazilian-stocks-fetcher.service");
let InvestmentsController = class InvestmentsController {
    investmentsService;
    externalAssetsService;
    assetSyncService;
    brazilianStocksFetcher;
    constructor(investmentsService, externalAssetsService, assetSyncService, brazilianStocksFetcher) {
        this.investmentsService = investmentsService;
        this.externalAssetsService = externalAssetsService;
        this.assetSyncService = assetSyncService;
        this.brazilianStocksFetcher = brazilianStocksFetcher;
    }
    async create(userId, createDto) {
        const operation = await this.investmentsService.create(userId, createDto);
        return {
            message: 'Operação de investimento criada com sucesso',
            data: operation,
        };
    }
    async findAll(userId) {
        const operations = await this.investmentsService.findAll(userId);
        return { data: operations };
    }
    async findOne(id, userId) {
        const operation = await this.investmentsService.findOne(id, userId);
        return { data: operation };
    }
    async update(id, userId, updateDto) {
        const operation = await this.investmentsService.update(id, userId, updateDto);
        return {
            message: 'Operação de investimento atualizada com sucesso',
            data: operation,
        };
    }
    async remove(id, userId) {
        await this.investmentsService.remove(id, userId);
    }
    async getCurrentPosition(userId) {
        const position = await this.investmentsService.getCurrentPosition(userId);
        return { data: position };
    }
    async getMonthlyEvolution(userId) {
        const evolution = await this.investmentsService.getMonthlyEvolution(userId);
        return { data: evolution };
    }
    async getOperationsByAsset(asset, userId) {
        const operations = await this.investmentsService.getOperationsByAsset(userId, asset);
        return { data: operations };
    }
    async getOperationsByMonth(month, userId) {
        const operations = await this.investmentsService.getOperationsByMonth(userId, month);
        return { data: operations };
    }
    async getAssetTypes() {
        const assetTypes = await this.investmentsService.getAssetTypes();
        return { data: assetTypes };
    }
    async getExchanges() {
        const exchanges = await this.investmentsService.getExchanges();
        return { data: exchanges };
    }
    async searchAssets(search, assetGroup, limit, assetSearch, group, offset) {
        if (assetSearch !== undefined || group !== undefined) {
            const limitNum = limit ? parseInt(limit, 10) : 50;
            const offsetNum = offset ? parseInt(offset, 10) : 0;
            const assets = await this.externalAssetsService.searchAssets(assetSearch || search, group || assetGroup || 'STOCK', limitNum, offsetNum);
            return assets;
        }
        const assets = await this.investmentsService.searchAssets(search, assetGroup, limit ? parseInt(limit, 10) : 50);
        return { data: assets };
    }
    async syncAssets(group) {
        const synced = await this.investmentsService.syncAssetsFromAPI(group || 'STOCK');
        return {
            message: `${synced} assets sincronizados com sucesso`,
            synced,
        };
    }
    async syncAssetsFromExternal(group, limit) {
        const synced = await this.assetSyncService.syncAssetsFromExternalAPI(group || 'STOCK', limit ? parseInt(limit, 10) : 100);
        return {
            message: `${synced} assets sincronizados com sucesso da API externa`,
            synced,
        };
    }
    async syncAssetsBySearch(search, group) {
        if (!search) {
            return {
                message: 'Parâmetro "search" é obrigatório',
                synced: 0,
            };
        }
        const synced = await this.assetSyncService.syncAssetsBySearch(search, group || 'STOCK');
        return {
            message: `${synced} assets sincronizados com sucesso`,
            synced,
        };
    }
    async getAssetByTicker(ticker) {
        const asset = await this.investmentsService.getAssetByTicker(ticker);
        if (!asset) {
            return { data: null };
        }
        return { data: asset };
    }
    async getAssetsMyProfitFormat(assetSearch, group, limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : 50;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        const assets = await this.externalAssetsService.searchAssets(assetSearch, group || 'STOCK', limitNum, offsetNum);
        return assets;
    }
    async syncAllBrazilianStocks() {
        const result = await this.brazilianStocksFetcher.syncAllBrazilianStocks();
        return {
            message: `Sincronização concluída: ${result.created} criados, ${result.updated} atualizados`,
            created: result.created,
            updated: result.updated,
            total: result.created + result.updated,
        };
    }
};
exports.InvestmentsController = InvestmentsController;
__decorate([
    (0, common_1.Post)('operations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_investment_operation_dto_1.CreateInvestmentOperationDto]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('operations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('operations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('operations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_investment_operation_dto_1.UpdateInvestmentOperationDto]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('operations/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('position'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getCurrentPosition", null);
__decorate([
    (0, common_1.Get)('evolution'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getMonthlyEvolution", null);
__decorate([
    (0, common_1.Get)('operations/asset/:asset'),
    __param(0, (0, common_1.Param)('asset')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getOperationsByAsset", null);
__decorate([
    (0, common_1.Get)('operations/month/:month'),
    __param(0, (0, common_1.Param)('month')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getOperationsByMonth", null);
__decorate([
    (0, common_1.Get)('asset-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getAssetTypes", null);
__decorate([
    (0, common_1.Get)('exchanges'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getExchanges", null);
__decorate([
    (0, common_1.Get)('assets'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('assetGroup')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('assetSearch')),
    __param(4, (0, common_1.Query)('group')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "searchAssets", null);
__decorate([
    (0, common_1.Get)('assets/sync'),
    __param(0, (0, common_1.Query)('group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "syncAssets", null);
__decorate([
    (0, common_1.Get)('assets/sync-external'),
    __param(0, (0, common_1.Query)('group')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "syncAssetsFromExternal", null);
__decorate([
    (0, common_1.Get)('assets/sync-search'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "syncAssetsBySearch", null);
__decorate([
    (0, common_1.Get)('assets/ticker/:ticker'),
    __param(0, (0, common_1.Param)('ticker')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getAssetByTicker", null);
__decorate([
    (0, common_1.Get)('assets/myprofit'),
    __param(0, (0, common_1.Query)('assetSearch')),
    __param(1, (0, common_1.Query)('group')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getAssetsMyProfitFormat", null);
__decorate([
    (0, common_1.Get)('assets/sync-all-brazilian-stocks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "syncAllBrazilianStocks", null);
exports.InvestmentsController = InvestmentsController = __decorate([
    (0, common_1.Controller)('investments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [investments_service_1.InvestmentsService,
        external_assets_service_1.ExternalAssetsService,
        asset_sync_service_1.AssetSyncService,
        brazilian_stocks_fetcher_service_1.BrazilianStocksFetcherService])
], InvestmentsController);
//# sourceMappingURL=investments.controller.js.map