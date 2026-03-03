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
exports.Card = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
let Card = class Card {
    id;
    user;
    userId;
    nickname;
    lastFourDigits;
    dueDate;
    totalLimit;
    usedLimit;
    availableLimit;
    get calculatedAvailableLimit() {
        if (this.totalLimit === null || this.totalLimit === undefined) {
            return this.availableLimit ?? 0;
        }
        return (this.totalLimit ?? 0) - (this.usedLimit ?? 0);
    }
    closingDate;
    isDefault;
    createdAt;
    updatedAt;
};
exports.Card = Card;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Card.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Card.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Card.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Card.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 4, nullable: true }),
    __metadata("design:type", Object)
], Card.prototype, "lastFourDigits", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Card.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true, name: 'total_limit' }),
    __metadata("design:type", Object)
], Card.prototype, "totalLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0, name: 'used_limit' }),
    __metadata("design:type", Number)
], Card.prototype, "usedLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true, name: 'available_limit' }),
    __metadata("design:type", Object)
], Card.prototype, "availableLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Card.prototype, "closingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Card.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Card.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Card.prototype, "updatedAt", void 0);
exports.Card = Card = __decorate([
    (0, typeorm_1.Entity)('cards')
], Card);
//# sourceMappingURL=card.entity.js.map