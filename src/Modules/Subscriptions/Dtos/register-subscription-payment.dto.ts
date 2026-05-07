// dto/register-subscription-payment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class RegisterSubscriptionPaymentDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID da subscrição à qual pertence este pagamento',
  })
  @IsNotEmpty()
  subscriptionId!: string;
  
  @IsOptional()
  referenceMonth!: string;
  
  @IsOptional()
  dueDate!: string;

  @IsOptional()
  paidAt?: string;
}