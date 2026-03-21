import { ApiHideProperty, ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import {
  IsString, IsEmail, IsEnum, IsOptional,
  IsNotEmpty, MaxLength,
} from 'class-validator';
import { AcademyType } from 'generated/prisma/enums';
import { AccountDto } from 'src/Modules/Accounts/register-account.dto';

class CreateAcademyDto {

  @ApiProperty({
    example: 'Academia Dragão BJJ',
    description: 'Nome da academia',
  })
  @IsString()
  @IsNotEmpty({ message: 'Informe o nome da academia' })
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    enum: AcademyType,
    example: AcademyType.AFFILIATE,
    description: 'Tipo da academia: CENTRAL ou AFFILIATE',
  })
  @IsOptional()
  type?: AcademyType;

  @ApiPropertyOptional({
    example: 'Rua da Missão, nº 45',
    description: 'Endereço completo',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Luanda',
    description: 'Província onde se localiza',
  })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({
    example: 'Talatona',
    description: 'Cidade ou município',
  })
  @IsOptional()
  @IsString()
  city?: string;

  // Preenchido internamente pelo service após criar o Account — nunca vem do body
  @ApiHideProperty()
  accountId!: string;

  // Opcional no DTO porque pode vir do upload multipart ou não ser enviado
  @ApiPropertyOptional({
    example: '/uploads/AcademyLogos/12345-logo.png',
    description: 'URL do logotipo (preenchido automaticamente após upload)',
  })
  @IsOptional()
  @IsString({ message: 'O URL do logotipo deve ser uma string.' })
  logoUrl!: string;

  @IsOptional()
  @ApiHideProperty()
  affiliateNumber?: string;
}

class CreateAcademyRequestDto extends IntersectionType(CreateAcademyDto, AccountDto) {}

export { CreateAcademyDto, CreateAcademyRequestDto };