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
exports.InvestmentOperation = exports.AssetClass = exports.OperationType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
var OperationType;
(function (OperationType) {
    OperationType["BUY"] = "buy";
    OperationType["SELL"] = "sell";
    OperationType["DIVIDEND"] = "dividend";
    OperationType["INTEREST"] = "interest";
    OperationType["STOCK_SPLIT"] = "stock_split";
})(OperationType || (exports.OperationType = OperationType = {}));
var AssetClass;
(function (AssetClass) {
    AssetClass["STOCK"] = "stock";
    AssetClass["BOND"] = "bond";
    AssetClass["FUND"] = "fund";
    AssetClass["ETF"] = "etf";
    AssetClass["CRYPTO"] = "crypto";
    AssetClass["REAL_ESTATE"] = "real_estate";
    AssetClass["CASH"] = "cash";
    AssetClass["OTHER"] = "other";
})(AssetClass || (exports.AssetClass = AssetClass = {}));
let InvestmentOperation = class InvestmentOperation {
    id;
    user;
    userId;
    asset;
    assetClass;
    type;
    date;
    quantity;
    price;
    totalAmount;
    currency;
    broker;
    notes;
    createdAt;
    updatedAt;
};
exports.InvestmentOperation = InvestmentOperation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InvestmentOperation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], InvestmentOperation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], InvestmentOperation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], InvestmentOperation.prototype, "asset", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InvestmentOperation.prototype, "assetClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: OperationType }),
    __metadata("design:type", String)
], InvestmentOperation.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], InvestmentOperation.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], InvestmentOperation.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], InvestmentOperation.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], InvestmentOperation.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: 'BRL' }),
    __metadata("design:type", String)
], InvestmentOperation.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], InvestmentOperation.prototype, "broker", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], InvestmentOperation.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], InvestmentOperation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], InvestmentOperation.prototype, "updatedAt", void 0);
exports.InvestmentOperation = InvestmentOperation = __decorate([
    (0, typeorm_1.Entity)('investment_operations')
], InvestmentOperation);
//# sourceMappingURL=investment-operation.entity.js.map