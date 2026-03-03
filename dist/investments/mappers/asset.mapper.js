"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetMapper = void 0;
class AssetMapper {
    static toMyProfitFormat(externalData, assetGroup = 'STOCK', id = 1) {
        const ticker = externalData.ticker || '';
        const assetName = externalData.name || externalData.companyName || ticker;
        return {
            ID: id,
            AssetName: assetName,
            Ticker: ticker,
            Alias: ticker,
            TickerRef: '',
            Pic: externalData.logo || null,
            Sector: externalData.sector || null,
            SubSector: externalData.subsector || null,
            TypeTax: null,
            DueDate: null,
            Index: null,
            Tax: 0,
            Segment: externalData.segment || null,
            AssetType: null,
            CNPJ: externalData.cnpj || null,
            CNPJAdmin: null,
            Administrator: null,
            LegalName: externalData.companyName || assetName || null,
            CodeAPI: null,
            Exceptions: null,
            Market: 0,
            MarketString: 'Bovespa',
            Category: null,
            Exemption: false,
            AssetGroup: assetGroup,
            AssetSeries: null,
        };
    }
    static extractAssetType(ticker) {
        if (!ticker)
            return null;
        const match = ticker.match(/(\d+)$/);
        if (!match)
            return null;
        const suffix = match[1];
        if (suffix.length === 1) {
            const typeMap = {
                '3': 'ON',
                '4': 'PN',
                '5': 'PNA',
                '6': 'PNB',
            };
            return typeMap[suffix] || null;
        }
        else if (suffix === '11') {
            return 'UNT';
        }
        return null;
    }
    static applyAssetType(asset) {
        const assetType = this.extractAssetType(asset.Ticker);
        return {
            ...asset,
            AssetType: assetType,
        };
    }
    static mapArray(externalDataArray, assetGroup = 'STOCK', startId = 1) {
        return externalDataArray
            .map((data, index) => this.toMyProfitFormat(data, assetGroup, startId + index))
            .map((asset) => this.applyAssetType(asset));
    }
}
exports.AssetMapper = AssetMapper;
//# sourceMappingURL=asset.mapper.js.map