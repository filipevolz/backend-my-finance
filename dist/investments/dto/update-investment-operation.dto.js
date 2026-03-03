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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInvestmentOperationDto = void 0;
const class_validator_1 = require("class-validator");
const investment_operation_entity_1 = require("../investment-operation.entity");
class UpdateInvestmentOperationDto {
    asset;
    assetClass;
    type;
    date;
    quantity;
    price;
    currency;
    broker;
    notes;
}
exports.UpdateInvestmentOperationDto = UpdateInvestmentOperationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Ativo deve ser uma string' }),
    __metadata("design:type", String)
], UpdateInvestmentOperationDto.prototype, "asset", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Classe do ativo deve ser uma string' }),
    __metadata("design:type", String)
], UpdateInvestmentOperationDto.prototype, "assetClass", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(investment_operation_entity_1.OperationType, { message: 'Tipo de operação inválido' }),
    __metadata("design:type", String)
], UpdateInvestmentOperationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data inválida' }),
    __metadata("design:type", String)
], UpdateInvestmentOperationDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Quantidade deve ser um número' }),
    (0, class_validator_1.Min)(0, { message: 'Quantidade deve ser maior ou igual a zero' }),
    __metadata("design:type", Number)
], UpdateInvestmentOperationDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Preço deve ser um número' }),
    (0, class_validator_1.Min)(0, { message: 'Preço deve ser maior ou igual a zero' }),
    __metadata("design:type", Number)
], UpdateInvestmentOperationDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Moeda deve ser uma string' }),
    __metadata("design:type", String)
], UpdateInvestmentOperationDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Corretora deve ser uma string' }),
    __metadata("design:type", String)
], UpdateInvestmentOperationDto.prototype, "broker", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Observações deve ser uma string' }),
    __metadata("design:type", String)
], UpdateInvestmentOperationDto.prototype, "notes", void 0);
//# sourceMappingURL=update-investment-operation.dto.js.map