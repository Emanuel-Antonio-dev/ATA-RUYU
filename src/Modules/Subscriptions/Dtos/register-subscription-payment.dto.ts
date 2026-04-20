// dto/register-subscription-payment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class RegisterSubscriptionPaymentDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID da subscrição à qual pertence este pagamento',
  })
  @IsUUID()
  @IsNotEmpty()
  subscriptionId: string;

  @ApiProperty({
    example: '2026-02-01',
    description: 'Mês de referência do pagamento (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  referenceMonth: string;

  @ApiProperty({
    example: '2026-02-05',
    description: 'Data limite de pagamento (ISO 8601)',
  })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiPropertyOptional({
    example: '2026-02-04',
    description: 'Data em que foi efectuado o pagamento (ISO 8601). Omitir se ainda não foi pago.',
  })
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}