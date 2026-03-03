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
exports.InvestmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const investment_operation_entity_1 = require("./investment-operation.entity");
const asset_type_entity_1 = require("./asset-type.entity");
const exchange_entity_1 = require("./exchange.entity");
const asset_entity_1 = require("./asset.entity");
const external_assets_service_1 = require("./services/external-assets.service");
let InvestmentsService = class InvestmentsService {
    operationsRepository;
    assetTypeRepository;
    exchangeRepository;
    assetRepository;
    externalAssetsService;
    constructor(operationsRepository, assetTypeRepository, exchangeRepository, assetRepository, externalAssetsService) {
        this.operationsRepository = operationsRepository;
        this.assetTypeRepository = assetTypeRepository;
        this.exchangeRepository = exchangeRepository;
        this.assetRepository = assetRepository;
        this.externalAssetsService = externalAssetsService;
    }
    async create(userId, createDto) {
        const dateStr = createDto.date.split('T')[0];
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        let totalAmount;
        if (createDto.type === investment_operation_entity_1.OperationType.BUY ||
            createDto.type === investment_operation_entity_1.OperationType.SELL) {
            totalAmount = Math.round(createDto.quantity * createDto.price * 100);
        }
        else {
            totalAmount = Math.round(createDto.price * 100);
        }
        const operation = this.operationsRepository.create({
            userId,
            asset: createDto.asset,
            assetClass: createDto.assetClass || 'other',
            type: createDto.type,
            date,
            quantity: Math.round(createDto.quantity * 10000),
            price: Math.round(createDto.price * 100),
            totalAmount,
            currency: createDto.currency || 'BRL',
            broker: createDto.broker || null,
            notes: createDto.notes || null,
        });
        return await this.operationsRepository.save(operation);
    }
    async findAll(userId) {
        return await this.operationsRepository.find({
            where: { userId },
            order: { date: 'DESC', createdAt: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const operation = await this.operationsRepository.findOne({
            where: { id },
        });
        if (!operation) {
            throw new common_1.NotFoundException('Operação não encontrada');
        }
        if (operation.userId !== userId) {
            throw new common_1.ForbiddenException('Você não tem permissão para acessar esta operação');
        }
        return operation;
    }
    async update(id, userId, updateDto) {
        const operation = await this.findOne(id, userId);
        if (updateDto.date) {
            const dateStr = updateDto.date.split('T')[0];
            const [year, month, day] = dateStr.split('-').map(Number);
            operation.date = new Date(year, month - 1, day);
        }
        if (updateDto.asset)
            operation.asset = updateDto.asset;
        if (updateDto.assetClass)
            operation.assetClass = updateDto.assetClass;
        if (updateDto.type)
            operation.type = updateDto.type;
        if (updateDto.quantity !== undefined) {
            operation.quantity = Math.round(updateDto.quantity * 10000);
        }
        if (updateDto.price !== undefined) {
            operation.price = Math.round(updateDto.price * 100);
        }
        if (updateDto.currency)
            operation.currency = updateDto.currency;
        if (updateDto.broker !== undefined)
            operation.broker = updateDto.broker;
        if (updateDto.notes !== undefined)
            operation.notes = updateDto.notes;
        if (updateDto.type ||
            updateDto.quantity !== undefined ||
            updateDto.price !== undefined) {
            const type = updateDto.type || operation.type;
            const quantity = updateDto.quantity !== undefined
                ? updateDto.quantity
                : operation.quantity / 10000;
            const price = updateDto.price !== undefined ? updateDto.price : operation.price / 100;
            if (type === investment_operation_entity_1.OperationType.BUY || type === investment_operation_entity_1.OperationType.SELL) {
                operation.totalAmount = Math.round(quantity * price * 100);
            }
            else {
                operation.totalAmount = Math.round(price * 100);
            }
        }
        return await this.operationsRepository.save(operation);
    }
    async remove(id, userId) {
        const operation = await this.findOne(id, userId);
        await this.operationsRepository.remove(operation);
    }
    async getCurrentPosition(userId) {
        const operations = await this.findAll(userId);
        const positions = {};
        operations.forEach((op) => {
            const key = `${op.asset}_${op.currency}`;
            if (!positions[key]) {
                positions[key] = {
                    asset: op.asset,
                    assetClass: op.assetClass,
                    quantity: 0,
                    totalInvested: 0,
                    totalSold: 0,
                    operations: [],
                    brokers: new Set(),
                    currencies: new Set(),
                    firstBuyDate: null,
                    lastOperationDate: null,
                };
            }
            const position = positions[key];
            const opDate = new Date(op.date);
            position.operations.push(op);
            position.brokers.add(op.broker || '');
            position.currencies.add(op.currency);
            if (op.type === investment_operation_entity_1.OperationType.BUY) {
                position.quantity += op.quantity / 10000;
                position.totalInvested += op.totalAmount;
                if (!position.firstBuyDate || opDate < position.firstBuyDate) {
                    position.firstBuyDate = opDate;
                }
            }
            if (op.type === investment_operation_entity_1.OperationType.SELL) {
                const sellQuantity = op.quantity / 10000;
                const sellValue = op.totalAmount;
                if (position.quantity > 0) {
                    const avgPrice = position.totalInvested / (position.quantity * 100);
                    const costBasis = Math.min(sellQuantity, position.quantity) * avgPrice * 100;
                    position.quantity = Math.max(0, position.quantity - sellQuantity);
                    position.totalInvested = Math.max(0, position.totalInvested - costBasis);
                    position.totalSold += sellValue;
                }
            }
            if (!position.lastOperationDate || opDate > position.lastOperationDate) {
                position.lastOperationDate = opDate;
            }
        });
        const activePositions = Object.values(positions).filter((p) => p.quantity > 0);
        const totalPortfolioValue = activePositions.reduce((sum, p) => sum + p.totalInvested, 0);
        return activePositions.map((position) => {
            const averagePrice = position.quantity > 0
                ? position.totalInvested / (position.quantity * 100)
                : 0;
            const currentValue = position.totalInvested;
            const profit = currentValue - position.totalInvested;
            const profitPercentage = position.totalInvested > 0
                ? (profit / position.totalInvested) * 100
                : 0;
            const portfolioPercentage = totalPortfolioValue > 0
                ? (position.totalInvested / totalPortfolioValue) * 100
                : 0;
            let averageHoldingTime = 0;
            if (position.firstBuyDate && position.lastOperationDate) {
                const first = new Date(position.firstBuyDate).getTime();
                const last = new Date(position.lastOperationDate).getTime();
                if (!isNaN(first) && !isNaN(last)) {
                    const diffTime = last - first;
                    averageHoldingTime = Math.round(diffTime / (1000 * 60 * 60 * 24));
                }
            }
            return {
                asset: position.asset,
                assetClass: position.assetClass,
                quantity: position.quantity,
                averagePrice,
                currentValue,
                totalInvested: position.totalInvested,
                profit,
                profitPercentage,
                portfolioPercentage,
                broker: Array.from(position.brokers)
                    .filter((b) => b)
                    .join(', ') || null,
                currency: Array.from(position.currencies)[0] || 'BRL',
                averageHoldingTime,
            };
        });
    }
    async getMonthlyEvolution(userId) {
        const operations = await this.findAll(userId);
        const monthlyData = {};
        operations.forEach((op) => {
            const date = new Date(op.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    contributions: 0,
                    withdrawals: 0,
                    dividends: 0,
                    operations: [],
                };
            }
            monthlyData[monthKey].operations.push(op);
            if (op.type === investment_operation_entity_1.OperationType.BUY) {
                monthlyData[monthKey].contributions += op.totalAmount;
            }
            else if (op.type === investment_operation_entity_1.OperationType.SELL) {
                monthlyData[monthKey].withdrawals += op.totalAmount;
            }
            else if (op.type === investment_operation_entity_1.OperationType.DIVIDEND ||
                op.type === investment_operation_entity_1.OperationType.INTEREST) {
                monthlyData[monthKey].dividends += op.totalAmount;
            }
        });
        const sortedMonths = Object.keys(monthlyData).sort();
        let cumulativeContributions = 0;
        let cumulativeDividends = 0;
        let previousPortfolioValue = 0;
        return sortedMonths.map((month, index) => {
            const data = monthlyData[month];
            cumulativeContributions += data.contributions;
            cumulativeDividends += data.dividends;
            const portfolioValue = cumulativeContributions -
                sortedMonths
                    .slice(0, index + 1)
                    .reduce((sum, m) => sum + monthlyData[m].withdrawals, 0) +
                cumulativeDividends;
            const returns = previousPortfolioValue > 0
                ? ((portfolioValue -
                    previousPortfolioValue -
                    data.contributions +
                    data.withdrawals) /
                    previousPortfolioValue) *
                    100
                : 0;
            previousPortfolioValue = portfolioValue;
            return {
                month,
                portfolioValue,
                contributions: data.contributions,
                withdrawals: data.withdrawals,
                dividends: data.dividends,
                returns,
                cumulativeContributions,
                cumulativeDividends,
            };
        });
    }
    async getOperationsByAsset(userId, asset) {
        return await this.operationsRepository.find({
            where: { userId, asset },
            order: { date: 'ASC', createdAt: 'ASC' },
        });
    }
    async getOperationsByMonth(userId, month) {
        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
        return await this.operationsRepository
            .createQueryBuilder('operation')
            .where('operation.user_id = :userId', { userId })
            .andWhere('operation.date >= :startDate', {
            startDate: startDate.toISOString().split('T')[0],
        })
            .andWhere('operation.date <= :endDate', {
            endDate: endDate.toISOString().split('T')[0],
        })
            .orderBy('operation.date', 'ASC')
            .addOrderBy('operation.created_at', 'ASC')
            .getMany();
    }
    async getAssetTypes() {
        return await this.assetTypeRepository.find({
            order: { groupName: 'ASC' },
        });
    }
    async getExchanges() {
        return await this.exchangeRepository.find({
            order: { exchangeName: 'ASC' },
        });
    }
    async seedAssetTypes(assetTypes) {
        const existing = await this.assetTypeRepository.count();
        if (existing === 0) {
            await this.assetTypeRepository.save(this.assetTypeRepository.create(assetTypes));
        }
    }
    async seedExchanges(exchanges) {
        const existing = await this.exchangeRepository.count();
        if (existing === 0) {
            const batchSize = 100;
            for (let i = 0; i < exchanges.length; i += batchSize) {
                const batch = exchanges.slice(i, i + batchSize);
                await this.exchangeRepository.save(this.exchangeRepository.create(batch));
            }
        }
    }
    async seedAssets(assets) {
        const existing = await this.assetRepository.count();
        if (existing === 0) {
            const batchSize = 100;
            for (let i = 0; i < assets.length; i += batchSize) {
                const batch = assets.slice(i, i + batchSize);
                await this.assetRepository.save(this.assetRepository.create(batch));
            }
        }
    }
    async fetchAssetsFromAPI(assetSearch = '', group = 'STOCK') {
        try {
            const url = new URL('https://myprofitweb.com/API/Assets');
            if (assetSearch) {
                url.searchParams.append('assetSearch', assetSearch);
            }
            if (group) {
                url.searchParams.append('group', group);
            }
            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Erro ao buscar assets da API:', error);
            throw error;
        }
    }
    async syncAssetsFromAPI(group = 'STOCK') {
        try {
            const assetsFromAPI = await this.fetchAssetsFromAPI('', group);
            let synced = 0;
            for (const apiAsset of assetsFromAPI) {
                const ticker = apiAsset.Ticker?.trim();
                if (!ticker)
                    continue;
                const existing = await this.assetRepository.findOne({
                    where: { ticker },
                });
                if (!existing) {
                    let dueDate = null;
                    if (apiAsset.DueDate) {
                        dueDate = new Date(apiAsset.DueDate);
                    }
                    const asset = this.assetRepository.create({
                        assetName: apiAsset.AssetName?.trim() || '',
                        ticker,
                        alias: apiAsset.Alias?.trim() || null,
                        tickerRef: apiAsset.TickerRef?.trim() || null,
                        pic: apiAsset.Pic?.trim() || null,
                        sector: apiAsset.Sector?.trim() || null,
                        subSector: apiAsset.SubSector?.trim() || null,
                        typeTax: apiAsset.TypeTax?.trim() || null,
                        dueDate,
                        index: apiAsset.Index?.trim() || null,
                        tax: apiAsset.Tax || 0,
                        segment: apiAsset.Segment?.trim() || null,
                        assetType: apiAsset.AssetType?.trim() || null,
                        cnpj: apiAsset.CNPJ?.trim() || null,
                        cnpjAdmin: apiAsset.CNPJAdmin?.trim() || null,
                        administrator: apiAsset.Administrator?.trim() || null,
                        legalName: apiAsset.LegalName?.trim() || null,
                        codeAPI: apiAsset.CodeAPI || null,
                        exceptions: apiAsset.Exceptions?.trim() || null,
                        market: apiAsset.Market || 0,
                        marketString: apiAsset.MarketString?.trim() || null,
                        category: apiAsset.Category?.trim() || null,
                        exemption: apiAsset.Exemption || false,
                        assetGroup: apiAsset.AssetGroup?.trim() || group,
                        assetSeries: apiAsset.AssetSeries?.trim() || null,
                    });
                    await this.assetRepository.save(asset);
                    synced++;
                }
            }
            return synced;
        }
        catch (error) {
            console.error('Erro ao sincronizar assets:', error);
            throw error;
        }
    }
    async searchAssets(search, assetGroup, limit = 50) {
        const myProfitAssets = await this.externalAssetsService.searchAssets(search, assetGroup || 'STOCK', limit, 0);
        return myProfitAssets.map((asset) => ({
            id: asset.ID,
            assetName: asset.AssetName,
            ticker: asset.Ticker,
            alias: asset.Alias,
            tickerRef: asset.TickerRef,
            pic: asset.Pic,
            sector: asset.Sector,
            subSector: asset.SubSector,
            typeTax: asset.TypeTax,
            dueDate: asset.DueDate,
            index: asset.Index,
            tax: asset.Tax,
            segment: asset.Segment,
            assetType: asset.AssetType,
            cnpj: asset.CNPJ,
            cnpjAdmin: asset.CNPJAdmin,
            administrator: asset.Administrator,
            legalName: asset.LegalName,
            codeAPI: asset.CodeAPI,
            exceptions: asset.Exceptions,
            market: asset.Market,
            marketString: asset.MarketString,
            category: asset.Category,
            exemption: asset.Exemption,
            assetGroup: asset.AssetGroup,
            assetSeries: asset.AssetSeries,
        }));
    }
    async getAssetByTicker(ticker) {
        const assets = await this.externalAssetsService.searchAssets(ticker, undefined, 1, 0);
        const asset = assets.find((a) => a.Ticker === ticker);
        return asset || null;
    }
};
exports.InvestmentsService = InvestmentsService;
exports.InvestmentsService = InvestmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(investment_operation_entity_1.InvestmentOperation)),
    __param(1, (0, typeorm_1.InjectRepository)(asset_type_entity_1.AssetType)),
    __param(2, (0, typeorm_1.InjectRepository)(exchange_entity_1.Exchange)),
    __param(3, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        external_assets_service_1.ExternalAssetsService])
], InvestmentsService);
//# sourceMappingURL=investments.service.js.map