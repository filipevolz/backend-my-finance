import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BankStatementService } from './bank-statement.service';

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB

@Controller('bank-statement')
@UseGuards(JwtAuthGuard)
export class BankStatementController {
  constructor(private readonly bankStatementService: BankStatementService) {}

  @Post('import-from-pdf')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_PDF_SIZE },
    }),
  )
  async importFromPdf(
    @CurrentUser() userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo PDF é obrigatório.');
    }
    const result = await this.bankStatementService.importFromPdf(userId, file);
    const total = result.expensesCreated + result.incomesCreated;
    return {
      message: `${result.expensesCreated} saída(s) e ${result.incomesCreated} entrada(s) importada(s).`,
      data: {
        expensesCreated: result.expensesCreated,
        incomesCreated: result.incomesCreated,
        errors: result.errors.length > 0 ? result.errors : undefined,
      },
    };
  }
}
