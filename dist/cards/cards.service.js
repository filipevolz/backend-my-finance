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
exports.CardsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const card_entity_1 = require("./card.entity");
const expense_entity_1 = require("../expenses/expense.entity");
let CardsService = class CardsService {
    cardsRepository;
    expensesRepository;
    constructor(cardsRepository, expensesRepository) {
        this.cardsRepository = cardsRepository;
        this.expensesRepository = expensesRepository;
    }
    async create(userId, createCardDto) {
        if (createCardDto.isDefault) {
            await this.removeDefaultFromOtherCards(userId);
        }
        const card = this.cardsRepository.create({
            userId,
            nickname: createCardDto.nickname,
            lastFourDigits: createCardDto.lastFourDigits || null,
            dueDate: createCardDto.dueDate,
            totalLimit: createCardDto.totalLimit,
            usedLimit: 0,
            availableLimit: createCardDto.totalLimit,
            closingDate: createCardDto.closingDate,
            isDefault: createCardDto.isDefault ?? false,
        });
        return await this.cardsRepository.save(card);
    }
    async findAll(userId) {
        return await this.cardsRepository.find({
            where: { userId },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const card = await this.cardsRepository.findOne({
            where: { id },
        });
        if (!card) {
            throw new common_1.NotFoundException('Cartão não encontrado');
        }
        if (card.userId !== userId) {
            throw new common_1.ForbiddenException('Você não tem permissão para acessar este cartão');
        }
        if ((card.totalLimit === null || card.totalLimit === undefined) && card.availableLimit) {
            card.totalLimit = card.availableLimit;
            card.usedLimit = 0;
        }
        if (card.totalLimit !== null && card.totalLimit !== undefined) {
            card.availableLimit = card.totalLimit - (card.usedLimit ?? 0);
        }
        else if (card.availableLimit === null || card.availableLimit === undefined) {
            card.availableLimit = 0;
        }
        return card;
    }
    async findDefault(userId) {
        return await this.cardsRepository.findOne({
            where: { userId, isDefault: true },
        });
    }
    async update(id, userId, updateCardDto) {
        const card = await this.findOne(id, userId);
        if (updateCardDto.isDefault === true) {
            await this.removeDefaultFromOtherCards(userId, id);
        }
        Object.assign(card, updateCardDto);
        return await this.cardsRepository.save(card);
    }
    async remove(id, userId) {
        const card = await this.findOne(id, userId);
        await this.cardsRepository.remove(card);
    }
    async setAsDefault(id, userId) {
        const card = await this.findOne(id, userId);
        await this.removeDefaultFromOtherCards(userId, id);
        card.isDefault = true;
        return await this.cardsRepository.save(card);
    }
    async removeDefaultFromOtherCards(userId, excludeCardId) {
        const where = {
            userId,
            isDefault: true,
        };
        const cards = await this.cardsRepository.find({
            where,
        });
        const cardsToUpdate = excludeCardId
            ? cards.filter((card) => card.id !== excludeCardId)
            : cards;
        if (cardsToUpdate.length > 0) {
            await Promise.all(cardsToUpdate.map((card) => {
                card.isDefault = false;
                return this.cardsRepository.save(card);
            }));
        }
    }
    async recalculateUsedLimit(cardId, userId) {
        const card = await this.findOne(cardId, userId);
        const expenses = await this.expensesRepository.find({
            where: { cardId, userId },
        });
        let totalUsed = 0;
        for (const expense of expenses) {
            let amount;
            if (typeof expense.amount === 'string') {
                amount = parseInt(expense.amount, 10);
                if (isNaN(amount)) {
                    console.warn(`Valor inválido encontrado na expense ${expense.id}: ${expense.amount}`);
                    continue;
                }
            }
            else if (typeof expense.amount === 'bigint') {
                amount = Number(expense.amount);
            }
            else {
                amount = Number(expense.amount);
            }
            totalUsed += amount;
        }
        card.usedLimit = Math.max(0, Math.floor(totalUsed));
        return await this.cardsRepository.save(card);
    }
    async recalculateAllUsedLimits(userId) {
        const cards = await this.findAll(userId);
        const updatedCards = [];
        for (const card of cards) {
            const expenses = await this.expensesRepository.find({
                where: { cardId: card.id, userId },
            });
            let totalUsed = 0;
            for (const expense of expenses) {
                let amount;
                if (typeof expense.amount === 'string') {
                    amount = parseInt(expense.amount, 10);
                    if (isNaN(amount)) {
                        console.warn(`Valor inválido encontrado na expense ${expense.id}: ${expense.amount}`);
                        continue;
                    }
                }
                else if (typeof expense.amount === 'bigint') {
                    amount = Number(expense.amount);
                }
                else {
                    amount = Number(expense.amount);
                }
                totalUsed += amount;
            }
            card.usedLimit = Math.max(0, Math.floor(totalUsed));
            const updatedCard = await this.cardsRepository.save(card);
            updatedCards.push(updatedCard);
        }
        return updatedCards;
    }
};
exports.CardsService = CardsService;
exports.CardsService = CardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(card_entity_1.Card)),
    __param(1, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CardsService);
//# sourceMappingURL=cards.service.js.map