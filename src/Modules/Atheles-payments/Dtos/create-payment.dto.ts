import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsUUID,
  IsDateString, IsString, IsDecimal, IsNumber, Min,
} from 'class-validator';
import { PaymentStatus } from 'generated/prisma/enums';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID do atleta a quem pertence este pagamento',
  })
  @IsUUID()
  @IsNotEmpty()
  athleteId!: string;

  @ApiProperty({
    example: 5000,
    description: 'Valor da mensalidade em AOA',
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  @Type(() => Number)
  amount!: number;

  @ApiProperty({
    example: '2026-02-01',
    description: 'Mês de referência do pagamento (primeiro dia do mês, ISO 8601)',
  })
  @IsDateString({},{message:"Informe uma data válida(2026-10-01)"})
  @IsNotEmpty()
  referenceMonth!: Date;
  
  @ApiPropertyOptional({
    example: '2026-02-08',
    description: 'Data em que o pagamento foi efectuado (ISO 8601)',
  })
  @IsOptional()
  paidAt?: Date;
}
