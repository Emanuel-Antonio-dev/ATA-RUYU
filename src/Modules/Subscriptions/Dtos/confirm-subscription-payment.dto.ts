// dto/confirm-payment.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiPropertyOptional({
    example: '2026-02-10',
    description:
      'Data de confirmação do pagamento (ISO 8601). Se omitida, usa a data actual do servidor.',
  })
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}