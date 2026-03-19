import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsOptional, IsUUID,
  IsInt, Min, Max, IsBoolean, IsString,
} from 'class-validator';
import { BeltColor, BeltDegree } from 'generated/prisma/enums';
import { Type } from 'class-transformer';

// ── CREATE GRADUATION ────────────────────────────────────────
export class RegisterGraduationDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID do atleta a ser graduado',
  })
  @IsNotEmpty({ message: 'Informe o(a) atleta' })
  athleteId!: string;
  @IsOptional()
  academyId?: string;

  @ApiPropertyOptional({
    enum: BeltColor,
    example: BeltColor.BLUE,
    description: 'Faixa actual do atleta (antes da graduação)',
  })
  @IsOptional()
  @IsEnum(BeltColor)
  fromBelt?: BeltColor;

  @ApiPropertyOptional({
    enum: BeltDegree,
    example: BeltDegree.NONE,
    description: 'Grau actual do atleta',
  })
  @IsOptional()
  @IsEnum(BeltDegree)
  fromDegree?: BeltDegree;

  @ApiPropertyOptional({
    enum: BeltColor,
    example: BeltColor.PURPLE,
    description: 'Faixa proposta para o atleta',
  })
  @IsOptional()
  @IsEnum(BeltColor, {message:"Informe a faixa correctamente (WHITE, GREY, YELLOW, ORANGE, GREEN, BLUE, PURPLE, BROWN, BLACK)"})
  toBelt?: BeltColor;

  @ApiPropertyOptional({
    enum: BeltDegree,
    example: BeltDegree.NONE,
    description: 'Grau proposto para o atleta',
  })
  @IsOptional()
  @IsEnum(BeltDegree, {message:`Informe o grau correctamente (${BeltDegree})`})
  toDegree?: BeltDegree;
  @IsOptional()
  totalClasses?: number;
  @IsOptional()
  attendedClasses?: number;
}

// ── CREATE GRADUATION REVIEW ─────────────────────────────────
export class RegisterGraduationReviewDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID da graduação a ser avaliada',
  })
  @IsNotEmpty({ message: 'Informe o (a) atleta' })
  athleteId!: string;

  @ApiPropertyOptional({
    example: 8,
    description: 'Pontuação técnica de 1 a 10',
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  technicalScore?: number;

  @ApiPropertyOptional({
    example: 9,
    description: 'Pontuação de comportamento de 1 a 10',
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  behaviorScore?: number;

  @ApiProperty({
    example: 'Atleta demonstra boa técnica e postura. Recomendo a graduação.',
    description: 'Comentário do mestre/instrutor sobre o atleta',
  })
  @IsString()
  @IsNotEmpty({ message: 'Informe um comentário sobre o desempenho do(a) atleta.' })
  comment!: string;

  @ApiProperty({
    example: true,
    description: 'O mestre recomenda ou não a graduação deste atleta',
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'Informe a recomendação do mestre' })
  recommendation!: boolean;
}
export class RegisterGraduationDtoRequest extends PartialType(RegisterGraduationDto){}