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
var DadosMercadoProvider_1, B3Provider_1, ExternalAssetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalAssetsService = exports.B3Provider = exports.DadosMercadoProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const asset_mapper_1 = require("../mappers/asset.mapper");
const database_asset_provider_service_1 = require("./database-asset-provider.service");
const brapi_provider_service_1 = require("./brapi-provider.service");
const alpha_vantage_provider_service_1 = require("./alpha-vantage-provider.service");
let DadosMercadoProvider = DadosMercadoProvider_1 = class DadosMercadoProvider {
    logger = new common_1.Logger(DadosMercadoProvider_1.name);
    baseUrl = 'https://api.dadosdemercado.com.br';
    async searchAssets(search, group, limit = 50, offset = 0) {
        try {
            const url = new URL(`${this.baseUrl}/v1/ativos`);
            if (search) {
                url.searchParams.append('search', search);
            }
            if (limit) {
                url.searchParams.append('limit', limit.toString());
            }
            if (offset) {
                url.searchParams.append('offset', offset.toString());
            }
            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return (data.data || data || []).map((item) => ({
                ticker: item.ticker || item.symbol,
                name: item.name || item.companyName,
                companyName: item.companyName || item.name,
                sector: item.sector,
                subsector: item.subsector,
                segment: item.segment,
                cnpj: item.cnpj,
                market: item.market || 'Bovespa',
            }));
        }
        catch (error) {
            this.logger.error(`Erro ao buscar assets do Dados de Mercado: ${error.message}`);
            return [];
        }
    }
};
exports.DadosMercadoProvider = DadosMercadoProvider;
exports.DadosMercadoProvider = DadosMercadoProvider = DadosMercadoProvider_1 = __decorate([
    (0, common_1.Injectable)()
], DadosMercadoProvider);
let B3Provider = B3Provider_1 = class B3Provider {
    logger = new common_1.Logger(B3Provider_1.name);
    baseUrl = 'https://sistemaswebb3-listados.b3.com.br';
    async searchAssets(search, group, limit = 50, offset = 0) {
        try {
            this.logger.warn('B3Provider não implementado ainda');
            return [];
        }
        catch (error) {
            this.logger.error(`Erro ao buscar assets da B3: ${error.message}`);
            return [];
        }
    }
};
exports.B3Provider = B3Provider;
exports.B3Provider = B3Provider = B3Provider_1 = __decorate([
    (0, common_1.Injectable)()
], B3Provider);
let ExternalAssetsService = ExternalAssetsService_1 = class ExternalAssetsService {
    databaseProvider;
    dadosMercadoProvider;
    b3Provider;
    brapiProvider;
    alphaVantageProvider;
    configService;
    logger = new common_1.Logger(ExternalAssetsService_1.name);
    currentProvider;
    constructor(databaseProvider, dadosMercadoProvider, b3Provider, brapiProvider, alphaVantageProvider, configService) {
        this.databaseProvider = databaseProvider;
        this.dadosMercadoProvider = dadosMercadoProvider;
        this.b3Provider = b3Provider;
        this.brapiProvider = brapiProvider;
        this.alphaVantageProvider = alphaVantageProvider;
        this.configService = configService;
        const providerType = this.configService.get('ASSET_PROVIDER', 'DATABASE');
        switch (providerType.toUpperCase()) {
            case 'B3':
                this.currentProvider = b3Provider;
                break;
            case 'DADOS_MERCADO':
                this.currentProvider = dadosMercadoProvider;
                break;
            case 'BRAPI':
                this.currentProvider = brapiProvider;
                break;
            case 'ALPHA_VANTAGE':
                this.currentProvider = alphaVantageProvider;
                break;
            case 'DATABASE':
            default:
                this.currentProvider = databaseProvider;
                break;
        }
        this.logger.log(`Usando provedor de assets: ${providerType}`);
    }
    async searchAssets(assetSearch, group = 'STOCK', limit = 50, offset = 0) {
        try {
            const externalData = await this.currentProvider.searchAssets(assetSearch, group, limit, offset);
            let filteredData = externalData;
            if (group && group !== 'STOCK') {
                filteredData = externalData;
            }
            if (assetSearch) {
                const searchLower = assetSearch.toLowerCase();
                filteredData = filteredData.filter((asset) => asset.ticker?.toLowerCase().includes(searchLower) ||
                    asset.name?.toLowerCase().includes(searchLower) ||
                    asset.companyName?.toLowerCase().includes(searchLower));
            }
            return asset_mapper_1.AssetMapper.mapArray(filteredData, group, offset + 1);
        }
        catch (error) {
            this.logger.error(`Erro ao buscar assets: ${error.message}`);
            throw error;
        }
    }
    setProvider(provider) {
        this.currentProvider = provider;
        this.logger.log('Provedor de assets alterado');
    }
};
exports.ExternalAssetsService = ExternalAssetsService;
exports.ExternalAssetsService = ExternalAssetsService = ExternalAssetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_asset_provider_service_1.DatabaseAssetProvider,
        DadosMercadoProvider,
        B3Provider,
        brapi_provider_service_1.BrapiProvider,
        alpha_vantage_provider_service_1.AlphaVantageProvider,
        config_1.ConfigService])
], ExternalAssetsService);
//# sourceMappingURL=external-assets.service.js.map