import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsEnum, IsOptional, IsBoolean,
  IsDateString, IsEmail, MaxLength,
} from 'class-validator';
import { BeltColor, BeltDegree } from 'generated/prisma/enums';

class UpdateAthleteDto {
  @ApiPropertyOptional({ example: 'Paulo S. Mateus', description: 'Nome completo actualizado' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fullName?: string;

  @ApiPropertyOptional({ example: '1998-03-12', description: 'Data de nascimento (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'paulo@email.com', description: 'Email actualizado' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+244923456789', description: 'Telefone actualizado' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '+244912345678', description: 'Telefone de emergência actualizado' })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/foto.jpg', description: 'URL da foto' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({
    enum: BeltColor,
    example: BeltColor.BLUE,
    description: 'Faixa actualizada após graduação',
  })
  @IsOptional()
  @IsEnum(BeltColor)
  currentBelt?: BeltColor;

  @ApiPropertyOptional({
    enum: BeltDegree,
    example: BeltDegree.FIRST,
    description: 'Grau actualizado após graduação',
  })
  @IsOptional()
  @IsEnum(BeltDegree)
  currentDegree?: BeltDegree;

  @ApiPropertyOptional({ example: false, description: 'Activar ou desactivar o atleta' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

    @ApiPropertyOptional({ example: 'BI', description: 'Tipo de documento do atleta' })
    @IsEnum(['BI', 'PASSPORT'], {message: 'O tipo de documento deve ser BI ou PASSPORT'})
    documentType?: "BI" | "PASSPORT";
  
    @ApiPropertyOptional({ example: '12345678', description: 'Número do documento do atleta' })
    @IsString({message: 'O número do documento deve ser uma string'})
    documentNumber?: string;
    
    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID da academia à qual o atleta pertence' })
    @IsString()
    academyId?: string
}
class UpdateAthleteRequestDto extends PartialType(UpdateAthleteDto) {}
export { UpdateAthleteDto, UpdateAthleteRequestDto };