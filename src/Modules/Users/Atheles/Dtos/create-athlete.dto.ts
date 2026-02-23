import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsEnum, IsOptional, IsNotEmpty,
  IsDateString, IsEmail, IsPhoneNumber, MaxLength,
} from 'class-validator';
import { BeltColor, BeltDegree, DocumentType} from 'generated/prisma/enums';

export class CreateAthleteDto {
  @ApiProperty({ example: 'Paulo Sebastião Mateus', description: 'Nome completo do atleta' })
  @IsString()
  @IsNotEmpty({message: 'O nome completo é obrigatório'})
  @MaxLength(150)
  fullName!: string;

  @ApiProperty({ example: '1998-03-12', description: 'Data de nascimento (ISO 8601)' })
  @IsDateString()
  @IsNotEmpty({message: 'A data de nascimento é obrigatória'})
  birthDate!: string;

  @ApiPropertyOptional({ example: 'paulo@email.com', description: 'Email do atleta' })
  @IsOptional()
  @IsEmail({}, {message: 'O email deve ser válido'})
  email?: string;

  @ApiPropertyOptional({ example: '+244923456789', description: 'Telefone do atleta' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '+244912345678', description: 'Telefone de emergência' })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional({
    enum: BeltColor,
    example: BeltColor.WHITE,
    description: 'Faixa actual do atleta',
    default: BeltColor.WHITE,
  })
  @IsNotEmpty({message: 'A faixa actual é obrigatória'})
  @IsEnum(BeltColor, {message: 'A faixa actual deve ser um valor válido'})
  currentBelt?: BeltColor;

  @ApiPropertyOptional({
    enum: BeltDegree,
    example: BeltDegree.NONE,
    description: 'Grau actual da faixa',
    default: BeltDegree.NONE,
  })
  @IsNotEmpty({message: 'O grau actual é obrigatório'})
  @IsEnum(BeltDegree, {message: 'O grau actual deve ser um valor válido'})
  currentDegree?: BeltDegree;

  @ApiPropertyOptional({
    example: '/uploads/AthelePhotos/12345-photo.png',
    description: 'URL da foto do atleta (preenchido automaticamente após upload)', })
  @IsOptional()
  @IsString({message: 'A URL da foto deve ser uma string'})
  photoUrl?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID da academia à qual o atleta pertence' })
  @IsString()
  @IsNotEmpty({message: 'A academia é obrigatória'})
  academyId!: string

  @ApiProperty({ example: '1998-03-12', description: 'Data de inscrição do atleta (ISO 8601)' })
  @IsDateString()
  @IsNotEmpty({message: 'A data de inscrição é obrigatória'})
  enrolledAt!: string;

  @IsOptional()
  affiliateCode?: string;

  @ApiPropertyOptional({ example: 'BI', description: 'Tipo de documento do atleta' })
  @IsEnum(['BI', 'PASSPORT'], {message: 'O tipo de documento deve ser BI ou PASSPORT'})
  documentType!: DocumentType;

  @ApiPropertyOptional({ example: '12345678', description: 'Número do documento do atleta' })
  @IsString({message: 'O número do documento deve ser uma string'})
  documentNumber!: string;
}
