import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Expense } from '../expenses/expense.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
  ) {}

  async create(userId: string, createCardDto: CreateCardDto): Promise<Card> {
    // Se este cartão será o padrão, remover padrão dos outros
    if (createCardDto.isDefault) {
      await this.removeDefaultFromOtherCards(userId);
    }

    const card = this.cardsRepository.create({
      userId,
      nickname: createCardDto.nickname,
      lastFourDigits: createCardDto.lastFourDigits || null,
      dueDate: createCardDto.dueDate,
      totalLimit: createCardDto.totalLimit,
      usedLimit: 0, // Inicialmente sem uso
      availableLimit: createCardDto.totalLimit, // Manter compatibilidade
      closingDate: createCardDto.closingDate,
      isDefault: createCardDto.isDefault ?? false,
    });

    return await this.cardsRepository.save(card);
  }

  async findAll(userId: string): Promise<Card[]> {
    return await this.cardsRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Card> {
    const card = await this.cardsRepository.findOne({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    if (card.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este cartão',
      );
    }

    // Se não tem totalLimit mas tem availableLimit, migrar
    if ((card.totalLimit === null || card.totalLimit === undefined) && card.availableLimit) {
      card.totalLimit = card.availableLimit;
      card.usedLimit = 0;
    }

    // Calcular availableLimit
    if (card.totalLimit !== null && card.totalLimit !== undefined) {
      card.availableLimit = card.totalLimit - (card.usedLimit ?? 0);
    } else if (card.availableLimit === null || card.availableLimit === undefined) {
      card.availableLimit = 0;
    }

    return card;
  }

  async findDefault(userId: string): Promise<Card | null> {
    return await this.cardsRepository.findOne({
      where: { userId, isDefault: true },
    });
  }

  async update(
    id: string,
    userId: string,
    updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    const card = await this.findOne(id, userId);

    // Se este cartão será o padrão, remover padrão dos outros
    if (updateCardDto.isDefault === true) {
      await this.removeDefaultFromOtherCards(userId, id);
    }

    Object.assign(card, updateCardDto);

    return await this.cardsRepository.save(card);
  }

  async remove(id: string, userId: string): Promise<void> {
    const card = await this.findOne(id, userId);
    await this.cardsRepository.remove(card);
  }

  async setAsDefault(id: string, userId: string): Promise<Card> {
    const card = await this.findOne(id, userId);

    // Remover padrão dos outros cartões
    await this.removeDefaultFromOtherCards(userId, id);

    card.isDefault = true;
    return await this.cardsRepository.save(card);
  }

  /**
   * Marca o cartão como pago: zera o limite utilizado e marca todas as despesas
   * do cartão como incluídas na fatura paga (não entram mais no cálculo do limite).
   */
  async markAsPaid(id: string, userId: string): Promise<Card> {
    const card = await this.findOne(id, userId);
    card.usedLimit = 0;
    await this.cardsRepository.save(card);
    // Marcar todas as despesas deste cartão como "incluídas na fatura paga"
    const expenses = await this.expensesRepository.find({
      where: { cardId: id, userId },
    });
    for (const exp of expenses) {
      exp.includedInPaidInvoice = true;
      await this.expensesRepository.save(exp);
    }
    return card;
  }

  private async removeDefaultFromOtherCards(
    userId: string,
    excludeCardId?: string,
  ): Promise<void> {
    const where: { userId: string; isDefault: boolean } = {
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
      await Promise.all(
        cardsToUpdate.map((card) => {
          card.isDefault = false;
          return this.cardsRepository.save(card);
        }),
      );
    }
  }

  /**
   * Recalcula o usedLimit de um cartão baseado nas expenses existentes.
   * Só considera despesas que ainda não foram incluídas em fatura paga (includedInPaidInvoice = false).
   */
  async recalculateUsedLimit(cardId: string, userId: string): Promise<Card> {
    const card = await this.findOne(cardId, userId);

    // Buscar todas as expenses deste cartão que ainda contam no limite (não incluídas em fatura paga)
    const expenses = await this.expensesRepository.find({
      where: { cardId, userId },
    });

    let totalUsed = 0;
    for (const expense of expenses) {
      if (expense.includedInPaidInvoice) continue;
      let amount: number;
      if (typeof expense.amount === 'string') {
        // Se for string, pode ser um bigint do PostgreSQL
        amount = parseInt(expense.amount, 10);
        if (isNaN(amount)) {
          console.warn(`Valor inválido encontrado na expense ${expense.id}: ${expense.amount}`);
          continue;
        }
      } else if (typeof expense.amount === 'bigint') {
        amount = Number(expense.amount);
      } else {
        amount = Number(expense.amount);
      }
      totalUsed += amount;
    }

    // Atualizar o usedLimit - garantir que é um número inteiro válido
    card.usedLimit = Math.max(0, Math.floor(totalUsed));
    return await this.cardsRepository.save(card);
  }

  /**
   * Recalcula o usedLimit de todos os cartões do usuário
   */
  async recalculateAllUsedLimits(userId: string): Promise<Card[]> {
    const cards = await this.findAll(userId);
    
    const updatedCards: Card[] = [];
    
    for (const card of cards) {
      const expenses = await this.expensesRepository.find({
        where: { cardId: card.id, userId },
      });

      let totalUsed = 0;
      for (const expense of expenses) {
        if (expense.includedInPaidInvoice) continue;
        let amount: number;
        if (typeof expense.amount === 'string') {
          // Se for string, pode ser um bigint do PostgreSQL
          amount = parseInt(expense.amount, 10);
          if (isNaN(amount)) {
            console.warn(`Valor inválido encontrado na expense ${expense.id}: ${expense.amount}`);
            continue;
          }
        } else if (typeof expense.amount === 'bigint') {
          amount = Number(expense.amount);
        } else {
          amount = Number(expense.amount);
        }
        totalUsed += amount;
      }

      // Atualizar o usedLimit - garantir que é um número inteiro válido
      card.usedLimit = Math.max(0, Math.floor(totalUsed));
      const updatedCard = await this.cardsRepository.save(card);
      updatedCards.push(updatedCard);
    }
    
    return updatedCards;
  }
}
