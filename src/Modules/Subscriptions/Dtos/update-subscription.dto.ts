import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { SubscriptionStatus } from 'generated/prisma/enums';
import { Type } from 'class-transformer';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
    description: 'Novo estado da subscrição',
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({
    example: '2026-03-01',
    description: 'Início do novo período de facturação (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  currentPeriodStart?: string;

  @ApiPropertyOptional({
    example: '2026-03-31',
    description: 'Fim do novo período de facturação (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  currentPeriodEnd?: string;

  @ApiPropertyOptional({
    example: 35500,
    description: 'Valor mensal da subscrição em AOA',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  amount?: number;
}
