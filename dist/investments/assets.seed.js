"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAssetsSeed = loadAssetsSeed;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function loadAssetsSeed() {
    try {
        const jsonPath = path.join(process.cwd(), 'assets.json');
        const jsonData = fs.readFileSync(jsonPath, 'utf-8');
        const assets = JSON.parse(jsonData);
        return assets.map((asset) => {
            let dueDate = null;
            if (asset.DueDate) {
                dueDate = new Date(asset.DueDate);
            }
            return {
                assetName: asset.AssetName?.trim() || '',
                ticker: asset.Ticker?.trim() || '',
                alias: asset.Alias?.trim() || null,
                tickerRef: asset.TickerRef?.trim() || null,
                pic: asset.Pic?.trim() || null,
                sector: asset.Sector?.trim() || null,
                subSector: asset.SubSector?.trim() || null,
                typeTax: asset.TypeTax?.trim() || null,
                dueDate,
                index: asset.Index?.trim() || null,
                tax: asset.Tax || 0,
                segment: asset.Segment?.trim() || null,
                assetType: asset.AssetType?.trim() || null,
                cnpj: asset.CNPJ?.trim() || null,
                cnpjAdmin: asset.CNPJAdmin?.trim() || null,
                administrator: asset.Administrator?.trim() || null,
                legalName: asset.LegalName?.trim() || null,
                codeAPI: asset.CodeAPI || null,
                exceptions: asset.Exceptions?.trim() || null,
                market: asset.Market || 0,
                marketString: asset.MarketString?.trim() || null,
                category: asset.Category?.trim() || null,
                exemption: asset.Exemption || false,
                assetGroup: asset.AssetGroup?.trim() || 'STOCK',
                assetSeries: asset.AssetSeries?.trim() || null,
            };
        });
    }
    catch (error) {
        console.error('Erro ao carregar seed de assets:', error);
        return [];
    }
}
//# sourceMappingURL=assets.seed.js.map