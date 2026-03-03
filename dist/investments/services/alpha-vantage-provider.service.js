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
var AlphaVantageProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlphaVantageProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AlphaVantageProvider = AlphaVantageProvider_1 = class AlphaVantageProvider {
    configService;
    logger = new common_1.Logger(AlphaVantageProvider_1.name);
    baseUrl = 'https://www.alphavantage.co/query';
    constructor(configService) {
        this.configService = configService;
    }
    async searchAssets(search, group, limit = 50, offset = 0) {
        try {
            const apiKey = this.configService.get('ALPHA_VANTAGE_API_KEY');
            if (!apiKey) {
                this.logger.warn('ALPHA_VANTAGE_API_KEY não configurada');
                return [];
            }
            const tickers = this.getBrazilianTickers();
            let filteredTickers = tickers;
            if (search) {
                const searchLower = search.toLowerCase();
                filteredTickers = tickers.filter((ticker) => ticker.toLowerCase().includes(searchLower));
            }
            const paginatedTickers = filteredTickers.slice(offset, offset + limit);
            const assets = [];
            const batchSize = 5;
            for (let i = 0; i < Math.min(paginatedTickers.length, batchSize); i++) {
                const ticker = paginatedTickers[i];
                try {
                    const assetInfo = await this.fetchAssetInfo(`${ticker}.SA`, apiKey);
                    if (assetInfo) {
                        assets.push(assetInfo);
                    }
                    await this.delay(12000);
                }
                catch (error) {
                    this.logger.warn(`Erro ao buscar ${ticker}: ${error.message}`);
                }
            }
            return assets;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar assets do Alpha Vantage: ${error.message}`);
            return [];
        }
    }
    async fetchAssetInfo(ticker, apiKey) {
        try {
            const url = new URL(this.baseUrl);
            url.searchParams.append('function', 'OVERVIEW');
            url.searchParams.append('symbol', ticker);
            url.searchParams.append('apikey', apiKey);
            const response = await fetch(url.toString());
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            if (data['Error Message'] || data['Note']) {
                return null;
            }
            return {
                ticker: ticker.replace('.SA', ''),
                name: data.Name || ticker,
                companyName: data.Name || ticker,
                sector: data.Sector || undefined,
                subsector: undefined,
                segment: data.Industry || undefined,
                cnpj: undefined,
                market: 'Bovespa',
            };
        }
        catch (error) {
            return null;
        }
    }
    getBrazilianTickers() {
        return [
            'PETR4',
            'VALE3',
            'ITUB4',
            'BBDC4',
            'ABEV3',
            'WEGE3',
            'MGLU3',
            'RENT3',
            'SUZB3',
            'CMIG4',
            'BBAS3',
            'ELET3',
            'ELET6',
            'USIM5',
            'GGBR4',
            'CSAN3',
        ];
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.AlphaVantageProvider = AlphaVantageProvider;
exports.AlphaVantageProvider = AlphaVantageProvider = AlphaVantageProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AlphaVantageProvider);
//# sourceMappingURL=alpha-vantage-provider.service.js.map