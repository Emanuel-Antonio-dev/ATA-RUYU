// dto/create-subscription.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class RegisterSubscriptionDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID da academia para a qual a subscrição será criada',
  })
  @IsUUID()
  academyId!: string;

  @ApiPropertyOptional({
    example: 'AOA',
    description: 'Moeda da subscrição (padrão: AOA)',
    default: 'AOA',
  })
  @IsOptional()
  @IsString()
  currency?: string;
}