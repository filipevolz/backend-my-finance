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
exports.CreateExpenseDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateExpenseDto {
    name;
    category;
    amount;
    date;
    is_paid;
    cardId;
    installments;
}
exports.CreateExpenseDto = CreateExpenseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateExpenseDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateExpenseDto.prototype, "is_paid", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Allow)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' || value === 'none' ? null : value)),
    (0, class_validator_1.ValidateIf)((o) => o.cardId !== null && o.cardId !== undefined),
    (0, class_validator_1.IsUUID)(undefined, { message: 'cardId deve ser um UUID válido' }),
    __metadata("design:type", Object)
], CreateExpenseDto.prototype, "cardId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Allow)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? null : value)),
    (0, class_validator_1.ValidateIf)((o) => o.installments !== null && o.installments !== undefined),
    (0, class_validator_1.IsInt)({ message: 'installments deve ser um número inteiro' }),
    (0, class_validator_1.Min)(1, { message: 'installments deve ser no mínimo 1' }),
    (0, class_validator_1.Max)(24, { message: 'installments deve ser no máximo 24' }),
    __metadata("design:type", Object)
], CreateExpenseDto.prototype, "installments", void 0);
//# sourceMappingURL=create-expense.dto.js.map