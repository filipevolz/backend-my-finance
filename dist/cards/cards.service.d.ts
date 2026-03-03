import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Expense } from '../expenses/expense.entity';
export declare class CardsService {
    private cardsRepository;
    private expensesRepository;
    constructor(cardsRepository: Repository<Card>, expensesRepository: Repository<Expense>);
    create(userId: string, createCardDto: CreateCardDto): Promise<Card>;
    findAll(userId: string): Promise<Card[]>;
    findOne(id: string, userId: string): Promise<Card>;
    findDefault(userId: string): Promise<Card | null>;
    update(id: string, userId: string, updateCardDto: UpdateCardDto): Promise<Card>;
    remove(id: string, userId: string): Promise<void>;
    setAsDefault(id: string, userId: string): Promise<Card>;
    private removeDefaultFromOtherCards;
    recalculateUsedLimit(cardId: string, userId: string): Promise<Card>;
    recalculateAllUsedLimits(userId: string): Promise<Card[]>;
}
