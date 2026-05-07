import { ApiHideProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsString, IsNotEmpty } from 'class-validator';
import { PaymentStatus } from 'generated/prisma/enums';

class UpdatePaymentDto {
  @ApiPropertyOptional({
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    description: 'Novo estado do pagamento',
  })
  @IsNotEmpty({message:"Informe o estado do pagamento"})
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({
    example: '2026-02-08',
    description: 'Data em que o pagamento foi efectuado (ISO 8601)',
  })
  @IsOptional()
  paidAt?: Date;

  @ApiHideProperty()
  @IsOptional()
  receiptUrl?: string;
}
class UpdatePaymentRequestBody extends PartialType(UpdatePaymentDto) {}
export { UpdatePaymentDto, UpdatePaymentRequestBody};