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
exports.ExpensesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const expenses_service_1 = require("./expenses.service");
const create_expense_dto_1 = require("./dto/create-expense.dto");
const update_expense_dto_1 = require("./dto/update-expense.dto");
let ExpensesController = class ExpensesController {
    expensesService;
    constructor(expensesService) {
        this.expensesService = expensesService;
    }
    async create(userId, createExpenseDto) {
        const expense = await this.expensesService.create(userId, createExpenseDto);
        return {
            message: 'Despesa criada com sucesso',
            data: expense,
        };
    }
    async findAll(userId, period) {
        if (period) {
            const expenses = await this.expensesService.findByPeriod(userId, period);
            return { data: expenses };
        }
        const expenses = await this.expensesService.findAll(userId);
        return { data: expenses };
    }
    async findOne(id, userId) {
        const expense = await this.expensesService.findOne(id, userId);
        return { data: expense };
    }
    async update(id, userId, updateExpenseDto, updateGroup) {
        const expense = await this.expensesService.update(id, userId, updateExpenseDto, updateGroup === 'true');
        return {
            message: 'Despesa atualizada com sucesso',
            data: expense,
        };
    }
    async remove(id, userId) {
        await this.expensesService.remove(id, userId);
    }
    async findByGroupId(groupId, userId) {
        const expenses = await this.expensesService.findByGroupId(groupId, userId);
        return { data: expenses };
    }
    async removeGroup(groupId, userId) {
        await this.expensesService.removeGroup(groupId, userId);
    }
    async findByCategory(category, userId) {
        const expenses = await this.expensesService.findByCategory(userId, category);
        return { data: expenses };
    }
    async getByCategory(userId, period, startDate, endDate) {
        const stats = await this.expensesService.getByCategory(userId, period, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
        return { data: stats };
    }
};
exports.ExpensesController = ExpensesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_expense_dto_1.CreateExpenseDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(3, (0, common_1.Query)('updateGroup')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_expense_dto_1.UpdateExpenseDto, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('group/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findByGroupId", null);
__decorate([
    (0, common_1.Delete)('group/:groupId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "removeGroup", null);
__decorate([
    (0, common_1.Get)('category/:category'),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)('by-category/stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "getByCategory", null);
exports.ExpensesController = ExpensesController = __decorate([
    (0, common_1.Controller)('expenses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [expenses_service_1.ExpensesService])
], ExpensesController);
//# sourceMappingURL=expenses.controller.js.map