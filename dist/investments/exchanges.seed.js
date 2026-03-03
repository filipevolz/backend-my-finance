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
exports.loadExchangesSeed = loadExchangesSeed;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function loadExchangesSeed() {
    try {
        const jsonPath = path.join(process.cwd(), 'exchanges.json');
        const jsonData = fs.readFileSync(jsonPath, 'utf-8');
        const exchanges = JSON.parse(jsonData);
        return exchanges.map((ex) => ({
            exchangeName: ex.ExchangeName?.trim() || '',
            category: ex.Category || '',
            currency: ex.Currency || 'BRL',
            participantName: ex.ParticipantName || null,
            nameEnum: ex.NameEnum || null,
            cnpj: ex.CNPJ || null,
            code: ex.Code || null,
            countryCode: ex.CountryCode || null,
            url: ex.URL || null,
        }));
    }
    catch (error) {
        console.error('Erro ao carregar seed de exchanges:', error);
        return [];
    }
}
//# sourceMappingURL=exchanges.seed.js.map