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
exports.IncomesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const incomes_service_1 = require("./incomes.service");
const create_income_dto_1 = require("./dto/create-income.dto");
const update_income_dto_1 = require("./dto/update-income.dto");
let IncomesController = class IncomesController {
    incomesService;
    constructor(incomesService) {
        this.incomesService = incomesService;
    }
    async create(userId, createIncomeDto) {
        const incomes = await this.incomesService.create(userId, createIncomeDto);
        return {
            message: createIncomeDto.isRecurring
                ? 'Receitas recorrentes criadas com sucesso'
                : 'Receita criada com sucesso',
            data: incomes,
        };
    }
    async getStats(userId, period, startDate, endDate) {
        const stats = await this.incomesService.getStats(userId, period, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        return { data: stats };
    }
    async findAll(userId, period) {
        if (period) {
            const incomes = await this.incomesService.findByPeriod(userId, period);
            return { data: incomes };
        }
        const incomes = await this.incomesService.findAll(userId);
        return { data: incomes };
    }
    async getLatestTransactions(userId, limit) {
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        const transactions = await this.incomesService.getLatestTransactions(userId, limitNumber);
        return { data: transactions };
    }
    async getFirstTransactionDate(userId) {
        const date = await this.incomesService.getFirstTransactionDate(userId);
        return { data: { date } };
    }
    async getTransactions(userId, startDate, endDate, category, minAmount, maxAmount, description, period, month, year, type) {
        const transactions = await this.incomesService.getTransactions(userId, {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            category,
            minAmount: minAmount ? parseInt(minAmount, 10) : undefined,
            maxAmount: maxAmount ? parseInt(maxAmount, 10) : undefined,
            description,
            period,
            month: month ? parseInt(month, 10) : undefined,
            year: year ? parseInt(year, 10) : undefined,
            type,
        });
        return { data: transactions };
    }
    async findOne(id, userId) {
        const income = await this.incomesService.findOne(id, userId);
        return { data: income };
    }
    async update(id, userId, updateIncomeDto) {
        const income = await this.incomesService.update(id, userId, updateIncomeDto);
        return {
            message: 'Receita atualizada com sucesso',
            data: income,
        };
    }
    async remove(id, userId) {
        await this.incomesService.remove(id, userId);
    }
    async findByCategory(category, userId) {
        const incomes = await this.incomesService.findByCategory(userId, category);
        return { data: incomes };
    }
};
exports.IncomesController = IncomesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_income_dto_1.CreateIncomeDto]),
    __metadata("design:returntype", Promise)
], IncomesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], IncomesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IncomesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('latest-transactions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IncomesController.prototype, "getLatestTransactions", null);
__decorate([
    (0, common_1.Get)('first-transaction-date'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncomesController.prototype, "getFirstTransactionDate", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('minAmount')),
    __param(5, (0, common_1.Query)('maxAmount')),
    __param(6, (0, common_1.Query)('description')),
    __param(7, (0, common_1.Query)('period')),
    __param(8, (0, common_1.Query)('month')),
    __param(9, (0, common_1.Query)('year')),
    __param(10, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], IncomesController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IncomesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_income_dto_1.UpdateIncomeDto]),
    __metadata("design:returntype", Promise)
], IncomesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IncomesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('category/:category'),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IncomesController.prototype, "findByCategory", null);
exports.IncomesController = IncomesController = __decorate([
    (0, common_1.Controller)('incomes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [incomes_service_1.IncomesService])
], IncomesController);
//# sourceMappingURL=incomes.controller.js.map