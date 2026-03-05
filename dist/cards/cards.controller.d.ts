import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
export declare class CardsController {
    private readonly cardsService;
    constructor(cardsService: CardsService);
    create(userId: string, createCardDto: CreateCardDto): Promise<{
        message: string;
        data: import("./card.entity").Card;
    }>;
    findAll(userId: string): Promise<{
        data: import("./card.entity").Card[];
    }>;
    findDefault(userId: string): Promise<{
        data: import("./card.entity").Card | null;
    }>;
    findOne(id: string, userId: string): Promise<{
        data: import("./card.entity").Card;
    }>;
    update(id: string, userId: string, updateCardDto: UpdateCardDto): Promise<{
        message: string;
        data: import("./card.entity").Card;
    }>;
    setAsDefault(id: string, userId: string): Promise<{
        message: string;
        data: import("./card.entity").Card;
    }>;
    markAsPaid(id: string, userId: string): Promise<{
        message: string;
        data: import("./card.entity").Card;
    }>;
    remove(id: string, userId: string): Promise<void>;
    recalculateAllLimits(userId: string): Promise<{
        message: string;
        data: import("./card.entity").Card[];
    }>;
}
