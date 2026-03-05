import { Module } from '@nestjs/common';
import { BankStatementController } from './bank-statement.controller';
import { BankStatementService } from './bank-statement.service';
import { ExpensesModule } from '../expenses/expenses.module';
import { IncomesModule } from '../incomes/incomes.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, ExpensesModule, IncomesModule],
  controllers: [BankStatementController],
  providers: [BankStatementService],
})
export class BankStatementModule {}
