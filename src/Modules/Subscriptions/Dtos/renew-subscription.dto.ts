// dto/renew-subscription.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class RenewSubscriptionDto {
  @ApiPropertyOptional({
    example: '2026-03-01',
    description:
      'Data de início do novo período (ISO 8601). Se omitida, o backend calcula automaticamente.',
  })
  @IsOptional()
  @IsDateString()
  periodStart?: string;
}