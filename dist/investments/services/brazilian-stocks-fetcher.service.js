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
var BrazilianStocksFetcherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrazilianStocksFetcherService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const asset_entity_1 = require("../asset.entity");
let BrazilianStocksFetcherService = BrazilianStocksFetcherService_1 = class BrazilianStocksFetcherService {
    assetRepository;
    configService;
    logger = new common_1.Logger(BrazilianStocksFetcherService_1.name);
    constructor(assetRepository, configService) {
        this.assetRepository = assetRepository;
        this.configService = configService;
    }
    async fetchAllBrazilianTickers() {
        try {
            const tickers = [];
            try {
                const brapiTickers = await this.fetchTickersFromBrapi();
                tickers.push(...brapiTickers);
                this.logger.log(`Encontrados ${brapiTickers.length} tickers via brapi.dev`);
            }
            catch (error) {
                this.logger.warn(`Erro ao buscar tickers do brapi.dev: ${error.message}`);
            }
            try {
                const yahooTickers = await this.fetchTickersFromYahooFinance();
                tickers.push(...yahooTickers);
                this.logger.log(`Encontrados ${yahooTickers.length} tickers via Yahoo Finance`);
            }
            catch (error) {
                this.logger.warn(`Erro ao buscar tickers do Yahoo Finance: ${error.message}`);
            }
            const uniqueTickers = [...new Set(tickers)].sort();
            this.logger.log(`Total de ${uniqueTickers.length} tickers únicos encontrados`);
            return uniqueTickers;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar lista de tickers: ${error.message}`);
            throw error;
        }
    }
    async fetchTickersFromBrapi() {
        try {
            const url = 'https://brapi.dev/api/available';
            const token = this.configService.get('BRAPI_TOKEN');
            const response = await fetch(token ? `${url}?token=${token}` : url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            if (data.stocks && Array.isArray(data.stocks)) {
                return data.stocks.map((stock) => stock.code || stock).filter(Boolean);
            }
            return [];
        }
        catch (error) {
            this.logger.warn(`Erro ao buscar do brapi.dev: ${error.message}`);
            return [];
        }
    }
    async fetchTickersFromYahooFinance() {
        try {
            const url = 'https://query1.finance.yahoo.com/v1/finance/screener';
            const query = {
                crumb: '',
                lang: 'pt-BR',
                region: 'BR',
                quoteType: 'EQUITY',
                query: {
                    operator: 'AND',
                    operands: [
                        {
                            operator: 'EQ',
                            operands: ['region', 'BR'],
                        },
                    ],
                },
            };
            return this.getKnownBrazilianTickers();
        }
        catch (error) {
            this.logger.warn(`Erro ao buscar do Yahoo Finance: ${error.message}`);
            return this.getKnownBrazilianTickers();
        }
    }
    getKnownBrazilianTickers() {
        return [
            'ABEV3', 'ALPA4', 'ARZZ3', 'ASAI3', 'AZUL4', 'B3SA3', 'BBAS3', 'BBDC3', 'BBDC4',
            'BBSE3', 'BEEF3', 'BHIA3', 'BIDI11', 'BPAC11', 'BPAN4', 'BRAP4', 'BRDT3', 'BRFS3',
            'BRKM5', 'BRML3', 'BRSR6', 'CAML3', 'CCRO3', 'CIEL3', 'CMIG4', 'COGN3', 'CPLE6',
            'CRFB3', 'CSAN3', 'CSNA3', 'CSUD3', 'CURY3', 'CYRE3', 'DXCO3', 'ECOR3', 'EGIE3',
            'ELET3', 'ELET6', 'EMBR3', 'ENBR3', 'ENEV3', 'ENGI11', 'EQTL3', 'EZTEC3', 'FESA4',
            'FIBR3', 'FLRY3', 'GGBR4', 'GOAU4', 'GOLL4', 'GRND3', 'GUAR3', 'HAPV3', 'HBSA3',
            'HGTX3', 'HYPE3', 'IGTA3', 'IRBR3', 'ITSA4', 'ITUB3', 'ITUB4', 'JALL3', 'JBSS3',
            'JHSF3', 'JSLG3', 'KLBN11', 'LAVV3', 'LEVE3', 'LIGT3', 'LINX3', 'LREN3', 'LWSA3',
            'MGLU3', 'MRFG3', 'MRVE3', 'MULT3', 'MYPK3', 'NTCO3', 'ODPV3', 'OIBR3', 'OIBR4',
            'PCAR3', 'PETR3', 'PETR4', 'PETZ3', 'POMO4', 'PRIO3', 'PSSA3', 'QUAL3', 'RADL3',
            'RAIL3', 'RAIL3', 'RAPT4', 'RCSL4', 'RDOR3', 'RENT3', 'RLOG3', 'RNDP3', 'RNEW11',
            'ROMI3', 'RRRP3', 'SAPR11', 'SBSP3', 'SEER3', 'SGPS3', 'SHOW3', 'SIMA3', 'SLCE3',
            'SMAL11', 'SMLS3', 'SOMA3', 'SOND6', 'SQIA3', 'STBP3', 'SULA11', 'SUZB3', 'TAEE11',
            'TASA4', 'TCSA3', 'TECN3', 'TEND3', 'TIMS3', 'TOTS3', 'TPIS3', 'TRPL4', 'TUPY3',
            'UGPA3', 'UNIP6', 'USIM5', 'VALE3', 'VAMO3', 'VBBR3', 'VIVT3', 'VULC3', 'WEGE3',
            'WHRL4', 'WIZS3', 'WLMM4', 'YDUQ3',
            'ABEV4', 'ALPA3', 'ARZZ4', 'ASAI4', 'AZUL3', 'B3SA4', 'BBAS4', 'BBDC3', 'BBDC4',
            'BBSE4', 'BEEF4', 'BHIA4', 'BIDI4', 'BPAC5', 'BPAN3', 'BRAP3', 'BRDT4', 'BRFS4',
            'BRKM3', 'BRML4', 'BRSR3', 'CAML4', 'CCRO4', 'CIEL4', 'CMIG3', 'COGN4', 'CPLE3',
            'CRFB4', 'CSAN4', 'CSNA4', 'CSUD4', 'CURY4', 'CYRE4', 'DXCO4', 'ECOR4', 'EGIE4',
            'ELET3', 'ELET6', 'EMBR4', 'ENBR4', 'ENEV4', 'ENGI3', 'EQTL4', 'EZTEC4', 'FESA3',
            'FIBR4', 'FLRY4', 'GGBR3', 'GOAU3', 'GOLL3', 'GRND4', 'GUAR4', 'HAPV4', 'HBSA4',
            'HGTX4', 'HYPE4', 'IGTA4', 'IRBR4', 'ITSA3', 'ITUB3', 'ITUB4', 'JALL4', 'JBSS4',
            'JHSF4', 'JSLG4', 'KLBN3', 'LAVV4', 'LEVE4', 'LIGT4', 'LINX4', 'LREN4', 'LWSA4',
            'MGLU4', 'MRFG4', 'MRVE4', 'MULT4', 'MYPK4', 'NTCO4', 'ODPV4', 'OIBR3', 'OIBR4',
            'PCAR4', 'PETR3', 'PETR4', 'PETZ4', 'POMO3', 'PRIO4', 'PSSA4', 'QUAL4', 'RADL4',
            'RAIL4', 'RAPT3', 'RCSL3', 'RDOR4', 'RENT4', 'RLOG4', 'RNDP4', 'RNEW3', 'ROMI4',
            'RRRP4', 'SAPR3', 'SBSP4', 'SEER4', 'SGPS4', 'SHOW4', 'SIMA4', 'SLCE4', 'SMAL3',
            'SMLS4', 'SOMA4', 'SOND3', 'SQIA4', 'STBP4', 'SULA3', 'SUZB4', 'TAEE3', 'TASA3',
            'TCSA4', 'TECN4', 'TEND4', 'TIMS4', 'TOTS4', 'TPIS4', 'TRPL3', 'TUPY4', 'UGPA4',
            'UNIP3', 'USIM3', 'VALE3', 'VAMO4', 'VBBR4', 'VIVT4', 'VULC4', 'WEGE4', 'WHRL3',
            'WIZS4', 'WLMM3', 'YDUQ4',
            'ALSO11', 'BTLG11', 'DEVA11', 'FEXC11', 'GALG11', 'HGLG11', 'HGRU11', 'HGRE11',
            'HSAF11', 'IRDM11', 'KNRI11', 'MXRF11', 'RBRF11', 'RBRP11', 'RBRR11', 'RBRS11',
            'RBRY11', 'RECR11', 'RECT11', 'RZAG11', 'RZAK11', 'RZAT11', 'RZTR11', 'SARE11',
            'SDIL11', 'SNCI11', 'SNFF11', 'TGAR11', 'TRXF11', 'VILG11', 'VISC11', 'VSHO11',
            'XPML11', 'XPLG11', 'XPIN11', 'XPCI11', 'XPCM11', 'XPHT11', 'XPIM11', 'XPIE11',
            'XPID11', 'XPIC11', 'XPIB11', 'XPIA11', 'XPIF11', 'XPIG11', 'XPIL11', 'XPIS11',
            'XPIT11', 'XPIU11', 'XPIV11', 'XPIW11', 'XPIY11', 'XPIZ11',
        ];
    }
    async enrichStockData(ticker) {
        const stockData = {
            ticker,
            assetName: ticker,
        };
        try {
            const brapiData = await this.fetchFromBrapi(ticker);
            if (brapiData) {
                stockData.assetName = brapiData.name || stockData.assetName;
                stockData.legalName = brapiData.companyName || stockData.legalName;
                stockData.pic = brapiData.logo || stockData.pic;
            }
        }
        catch (error) {
            this.logger.debug(`Erro ao buscar ${ticker} do brapi.dev: ${error.message}`);
        }
        const alphaKey = this.configService.get('ALPHA_VANTAGE_API_KEY');
        if (alphaKey) {
            try {
                const alphaData = await this.fetchFromAlphaVantage(ticker, alphaKey);
                if (alphaData) {
                    stockData.assetName = alphaData.name || stockData.assetName;
                    stockData.legalName = alphaData.companyName || stockData.legalName;
                    stockData.sector = alphaData.sector || stockData.sector;
                    stockData.segment = alphaData.industry || stockData.segment;
                }
            }
            catch (error) {
                this.logger.debug(`Erro ao buscar ${ticker} do Alpha Vantage: ${error.message}`);
            }
        }
        stockData.assetType = this.extractAssetType(ticker);
        return stockData;
    }
    async fetchFromBrapi(ticker) {
        try {
            const url = `https://brapi.dev/api/quote/${ticker}`;
            const token = this.configService.get('BRAPI_TOKEN');
            const response = await fetch(token ? `${url}?token=${token}` : url);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            const result = data.results?.[0];
            if (!result) {
                return null;
            }
            return {
                name: result.longName || result.shortName,
                companyName: result.longName || result.shortName,
                logo: result.logo || null,
            };
        }
        catch (error) {
            return null;
        }
    }
    async fetchFromAlphaVantage(ticker, apiKey) {
        try {
            const url = new URL('https://www.alphavantage.co/query');
            url.searchParams.append('function', 'OVERVIEW');
            url.searchParams.append('symbol', `${ticker}.SA`);
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
                name: data.Name,
                companyName: data.Name,
                sector: data.Sector,
                industry: data.Industry,
            };
        }
        catch (error) {
            return null;
        }
    }
    extractAssetType(ticker) {
        const match = ticker.match(/(\d+)$/);
        if (!match)
            return undefined;
        const suffix = match[1];
        if (suffix.length === 1) {
            const typeMap = {
                '3': 'ON',
                '4': 'PN',
                '5': 'PNA',
                '6': 'PNB',
            };
            return typeMap[suffix];
        }
        else if (suffix === '11') {
            return 'UNT';
        }
        return undefined;
    }
    async syncAllBrazilianStocks() {
        this.logger.log('Iniciando sincronização completa de ações brasileiras...');
        const tickers = await this.fetchAllBrazilianTickers();
        this.logger.log(`Encontrados ${tickers.length} tickers para processar`);
        let created = 0;
        let updated = 0;
        let processed = 0;
        const batchSize = 10;
        for (let i = 0; i < tickers.length; i += batchSize) {
            const batch = tickers.slice(i, i + batchSize);
            for (const ticker of batch) {
                try {
                    const stockData = await this.enrichStockData(ticker);
                    if (!stockData) {
                        this.logger.warn(`Não foi possível obter dados para ${ticker}`);
                        continue;
                    }
                    const existing = await this.assetRepository.findOne({
                        where: { ticker },
                    });
                    if (existing) {
                        existing.assetName = stockData.assetName || existing.assetName;
                        existing.legalName = stockData.legalName || existing.legalName;
                        existing.sector = stockData.sector || existing.sector;
                        existing.subSector = stockData.subSector || existing.subSector;
                        existing.segment = stockData.segment || existing.segment;
                        existing.assetType = stockData.assetType || existing.assetType;
                        existing.pic = stockData.pic || existing.pic;
                        existing.marketString = 'Bovespa';
                        existing.assetGroup = 'STOCK';
                        await this.assetRepository.save(existing);
                        updated++;
                    }
                    else {
                        try {
                            const asset = this.assetRepository.create({
                                assetName: stockData.assetName || ticker,
                                ticker,
                                alias: ticker,
                                legalName: stockData.legalName || null,
                                sector: stockData.sector || null,
                                subSector: stockData.subSector || null,
                                segment: stockData.segment || null,
                                assetType: stockData.assetType || null,
                                cnpj: stockData.cnpj || null,
                                pic: stockData.pic || null,
                                marketString: 'Bovespa',
                                assetGroup: 'STOCK',
                                tax: 0,
                                market: 0,
                                exemption: false,
                            });
                            await this.assetRepository.save(asset);
                            created++;
                        }
                        catch (saveError) {
                            if (saveError.code === '23505' || saveError.message?.includes('unique')) {
                                this.logger.debug(`Ticker ${ticker} já existe (constraint unique)`);
                                const existing = await this.assetRepository.findOne({
                                    where: { ticker },
                                });
                                if (existing) {
                                    existing.assetName = stockData.assetName || existing.assetName;
                                    existing.legalName = stockData.legalName || existing.legalName;
                                    existing.sector = stockData.sector || existing.sector;
                                    existing.subSector = stockData.subSector || existing.subSector;
                                    existing.segment = stockData.segment || existing.segment;
                                    existing.assetType = stockData.assetType || existing.assetType;
                                    existing.pic = stockData.pic || existing.pic;
                                    existing.marketString = 'Bovespa';
                                    existing.assetGroup = 'STOCK';
                                    await this.assetRepository.save(existing);
                                    updated++;
                                }
                            }
                            else {
                                this.logger.error(`Erro ao salvar ${ticker}: ${saveError.message}`, saveError.stack);
                                throw saveError;
                            }
                        }
                    }
                    processed++;
                    if (processed % 10 === 0) {
                        this.logger.log(`Processados ${processed}/${tickers.length} tickers...`);
                    }
                    await this.delay(500);
                }
                catch (error) {
                    this.logger.error(`Erro ao processar ${ticker}: ${error.message}`, error.stack);
                }
            }
            if (i + batchSize < tickers.length) {
                await this.delay(2000);
            }
        }
        this.logger.log(`Sincronização concluída: ${created} criados, ${updated} atualizados, ${processed} processados`);
        return { created, updated };
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.BrazilianStocksFetcherService = BrazilianStocksFetcherService;
exports.BrazilianStocksFetcherService = BrazilianStocksFetcherService = BrazilianStocksFetcherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], BrazilianStocksFetcherService);
//# sourceMappingURL=brazilian-stocks-fetcher.service.js.map