import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean, IsDateString, IsNotEmpty,
  IsOptional, IsUUID, IsArray, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para marcar presença de um único atleta
export class MarkAttendanceDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID do atleta',
  })
  @IsNotEmpty({message:"Informe o(a) atleta"})
  athleteId!: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID da academia',
  })
  @IsNotEmpty({message:"Informe a academia"})
  academyId!: string;

  @ApiProperty({
    example: '2026-02-20',
    description: 'Data da aula (ISO 8601 — apenas a data, sem hora)',
  })
  @IsDateString({},{message:"Data inválida"})
  @IsNotEmpty({message:"Informe a data do treino"})
  classDate!: Date | string;

  @ApiProperty({
    example: true,
    description: 'true = presente, false = ausente',
    default: true,
  })
  @IsBoolean({message:"Status inválido"})
  present!: boolean;
}