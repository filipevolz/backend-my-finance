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
var BrapiProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrapiProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let BrapiProvider = BrapiProvider_1 = class BrapiProvider {
    configService;
    logger = new common_1.Logger(BrapiProvider_1.name);
    baseUrl = 'https://brapi.dev/api';
    constructor(configService) {
        this.configService = configService;
    }
    async searchAssets(search, group, limit = 50, offset = 0) {
        try {
            const token = this.configService.get('BRAPI_TOKEN');
            if (group === 'STOCK_USA') {
                return await this.searchUSStocks(search, limit, offset, token);
            }
            if (group === 'BDR') {
                return await this.searchBDRs(search, limit, offset, token);
            }
            const assets = [];
            let page = Math.floor(offset / 100) + 1;
            let itemsProcessed = 0;
            let hasNextPage = true;
            const maxPages = search ? 50 : 5;
            while (itemsProcessed < limit + offset && hasNextPage && page <= maxPages) {
                const url = new URL(`${this.baseUrl}/quote/list`);
                url.searchParams.append('page', page.toString());
                url.searchParams.append('limit', '100');
                if (token) {
                    url.searchParams.append('token', token);
                }
                const response = await fetch(url.toString());
                if (!response.ok) {
                    this.logger.warn(`Erro ao buscar página ${page}: HTTP ${response.status}`);
                    break;
                }
                const data = await response.json();
                if (data.stocks && Array.isArray(data.stocks)) {
                    for (const stock of data.stocks) {
                        const ticker = (stock.stock || stock.symbol || '').toUpperCase();
                        const name = (stock.name || '').toLowerCase();
                        if (search) {
                            const searchLower = search.toLowerCase();
                            const tickerLower = ticker.toLowerCase();
                            if (!tickerLower.includes(searchLower) && !name.includes(searchLower)) {
                                continue;
                            }
                        }
                        if (group) {
                            const stockType = stock.type?.toLowerCase() || '';
                            let assetGroup = 'STOCK';
                            if (ticker.endsWith('11'))
                                assetGroup = 'FII';
                            else if (ticker.endsWith('34'))
                                assetGroup = 'BDR';
                            else if (stockType.includes('etf'))
                                assetGroup = 'ETF';
                            else if (stockType.includes('fii'))
                                assetGroup = 'FII';
                            else if (stockType.includes('bdr'))
                                assetGroup = 'BDR';
                            if (assetGroup !== group) {
                                continue;
                            }
                        }
                        if (itemsProcessed < offset) {
                            itemsProcessed++;
                            continue;
                        }
                        if (assets.length >= limit) {
                            break;
                        }
                        assets.push({
                            ticker: ticker,
                            name: stock.name || ticker,
                            companyName: stock.longName || stock.name || ticker,
                            sector: stock.sector || undefined,
                            subsector: undefined,
                            segment: undefined,
                            cnpj: undefined,
                            market: 'Bovespa',
                            logo: stock.logo || stock.logourl || null,
                        });
                        itemsProcessed++;
                    }
                }
                hasNextPage = data.hasNextPage === true && assets.length < limit;
                page++;
                if (assets.length >= limit) {
                    break;
                }
                if (hasNextPage && page <= maxPages) {
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
            }
            this.logger.debug(`Busca concluída: ${assets.length} assets encontrados (páginas: ${page - 1})`);
            return assets;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar assets do brapi.dev: ${error.message}`);
            return [];
        }
    }
    async searchUSStocks(search, limit = 50, offset = 0, token) {
        const usStocks = [
            'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'NFLX',
            'AMD', 'INTC', 'CSCO', 'ORCL', 'CRM', 'ADBE', 'NOW', 'SNOW', 'PLTR',
            'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW', 'AXP', 'V', 'MA',
            'UNH', 'JNJ', 'PFE', 'ABBV', 'TMO', 'ABT', 'DHR', 'ISRG', 'REGN', 'GILD',
            'WMT', 'HD', 'MCD', 'SBUX', 'NKE', 'TGT', 'LOW', 'TJX', 'COST', 'BKNG',
            'XOM', 'CVX', 'COP', 'SLB', 'EOG',
            'BA', 'CAT', 'GE', 'HON', 'RTX', 'DE', 'UPS', 'LMT', 'NOC',
            'VZ', 'T', 'CMCSA', 'DIS', 'PARA',
            'LIN', 'APD', 'ECL',
            'NEE', 'DUK', 'SO', 'AEP',
            'AMT', 'PLD', 'EQIX', 'PSA',
            'BRK.B', 'PG', 'PM', 'MO', 'KO', 'PEP', 'AVGO', 'QCOM', 'TXN', 'AMAT',
            'KLAC', 'LRCX', 'ASML', 'SNPS', 'CDNS', 'ANET', 'FTNT', 'CRWD', 'ZS',
            'PANW', 'NET', 'DDOG', 'MDB', 'ESTC', 'DOCN', 'GTLB', 'FROG', 'TEAM',
            'ZM', 'DOCU', 'OKTA', 'SPLK', 'VRNS', 'QLYS', 'RDWR',
        ];
        let filteredStocks = usStocks;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredStocks = usStocks.filter((ticker) => ticker.toLowerCase().includes(searchLower));
        }
        const paginatedStocks = filteredStocks.slice(offset, offset + limit);
        const assets = [];
        for (const ticker of paginatedStocks) {
            try {
                const url = new URL(`${this.baseUrl}/quote/${ticker}`);
                if (token) {
                    url.searchParams.append('token', token);
                }
                const response = await fetch(url.toString());
                if (!response.ok) {
                    continue;
                }
                const data = await response.json();
                const result = data.results?.[0];
                if (!result) {
                    continue;
                }
                assets.push({
                    ticker: result.symbol || ticker,
                    name: result.longName || result.shortName || ticker,
                    companyName: result.longName || result.shortName || ticker,
                    sector: undefined,
                    subsector: undefined,
                    segment: undefined,
                    cnpj: undefined,
                    market: 'NYSE/NASDAQ',
                    logo: result.logourl || result.logo || null,
                });
                await new Promise((resolve) => setTimeout(resolve, 200));
            }
            catch (error) {
                this.logger.warn(`Erro ao buscar ${ticker}: ${error.message}`);
                continue;
            }
        }
        return assets;
    }
    async searchBDRs(search, limit = 50, offset = 0, token) {
        const bdrs = [
            'AAPL34', 'MSFT34', 'GOOGL34', 'GOOG34', 'AMZN34', 'META34', 'TSLA34',
            'NVDA34', 'NFLX34', 'AMD34', 'INTC34', 'CSCO34', 'ORCL34', 'CRM34',
            'ADBE34', 'NOW34', 'SNOW34', 'PLTR34',
            'JPM34', 'BAC34', 'WFC34', 'GS34', 'MS34', 'C34', 'BLK34', 'SCHW34',
            'AXP34', 'V34', 'MA34',
            'UNH34', 'JNJ34', 'PFE34', 'ABBV34', 'TMO34', 'ABT34', 'DHR34',
            'ISRG34', 'REGN34', 'GILD34',
            'WMT34', 'HD34', 'MCD34', 'SBUX34', 'NKE34', 'TGT34', 'LOW34',
            'TJX34', 'COST34', 'BKNG34',
            'XOM34', 'CVX34', 'COP34', 'SLB34', 'EOG34',
            'BA34', 'CAT34', 'GE34', 'HON34', 'RTX34', 'DE34', 'UPS34', 'LMT34',
            'NOC34',
            'VZ34', 'T34', 'CMCSA34', 'DIS34', 'PARA34',
            'LIN34', 'APD34', 'ECL34',
            'NEE34', 'DUK34', 'SO34', 'AEP34',
            'AMT34', 'PLD34', 'EQIX34', 'PSA34',
            'BRK34', 'PG34', 'PM34', 'MO34', 'KO34', 'PEP34', 'AVGO34', 'QCOM34',
            'TXN34', 'AMAT34', 'KLAC34', 'LRCX34', 'ASML34', 'SNPS34', 'CDNS34',
            'ANET34', 'FTNT34', 'CRWD34', 'ZS34', 'PANW34', 'NET34', 'DDOG34',
            'MDB34', 'ESTC34', 'DOCN34', 'GTLB34', 'FROG34', 'TEAM34', 'ZM34',
            'DOCU34', 'OKTA34', 'SPLK34', 'VRNS34', 'QLYS34', 'RDWR34',
            'COCA34', 'PEPB34', 'MELI34', 'ITLC34',
        ];
        let filteredBDRs = bdrs;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredBDRs = bdrs.filter((ticker) => ticker.toLowerCase().includes(searchLower));
        }
        const paginatedBDRs = filteredBDRs.slice(offset, offset + limit);
        const assets = [];
        for (const ticker of paginatedBDRs) {
            try {
                const url = new URL(`${this.baseUrl}/quote/${ticker}`);
                if (token) {
                    url.searchParams.append('token', token);
                }
                const response = await fetch(url.toString());
                if (!response.ok) {
                    continue;
                }
                const data = await response.json();
                const result = data.results?.[0];
                if (!result) {
                    continue;
                }
                assets.push({
                    ticker: result.symbol || ticker,
                    name: result.longName || result.shortName || ticker,
                    companyName: result.longName || result.shortName || ticker,
                    sector: undefined,
                    subsector: undefined,
                    segment: undefined,
                    cnpj: undefined,
                    market: 'Bovespa',
                    logo: result.logourl || result.logo || null,
                });
                await new Promise((resolve) => setTimeout(resolve, 200));
            }
            catch (error) {
                this.logger.warn(`Erro ao buscar ${ticker}: ${error.message}`);
                continue;
            }
        }
        return assets;
    }
    async fetchAssetInfo(ticker) {
        try {
            const url = new URL(`${this.baseUrl}/quote/${ticker}`);
            url.searchParams.append('token', this.configService.get('BRAPI_TOKEN') || '');
            const response = await fetch(url.toString());
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            const result = data.results?.[0];
            if (!result) {
                return null;
            }
            return {
                ticker: result.symbol || ticker,
                name: result.longName || result.shortName || ticker,
                companyName: result.longName || result.shortName || ticker,
                sector: undefined,
                subsector: undefined,
                segment: undefined,
                cnpj: undefined,
                market: 'Bovespa',
                logo: result.logo || null,
            };
        }
        catch (error) {
            this.logger.warn(`Erro ao buscar info do ticker ${ticker}: ${error.message}`);
            return null;
        }
    }
    getPopularTickers() {
        return [
            'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'WEGE3', 'MGLU3', 'RENT3',
            'SUZB3', 'CMIG4', 'BBAS3', 'ELET3', 'ELET6', 'USIM5', 'GGBR4', 'CSAN3',
            'BRAP4', 'RADL3', 'CCRO3', 'CYRE3', 'HAPV3', 'EGIE3', 'BRKM5', 'KLBN11',
            'QUAL3', 'TIMS3', 'VIVT3', 'TOTS3', 'RAIL3', 'SBSP3', 'CPLE6', 'CPFE3',
            'ELET6', 'GOAU4', 'CSNA3', 'PRIO3', 'UGPA3', 'DXCO3', 'LWSA3', 'RDOR3',
            'MRVE3', 'CAML3', 'ARZZ3', 'JHSF3', 'CURY3', 'DIRR3', 'YDUQ3', 'ALPA4',
            'BRML3', 'JALL3', 'MULT3', 'GUAR3', 'SOMA3', 'ENEV3', 'AERI3', 'AURE3',
        ];
    }
    async getAllAvailableTickers() {
        return this.getPopularTickers();
    }
};
exports.BrapiProvider = BrapiProvider;
exports.BrapiProvider = BrapiProvider = BrapiProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BrapiProvider);
//# sourceMappingURL=brapi-provider.service.js.map