import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, MaxLength, IsPhoneNumber, Matches, MinLength, IsNotEmpty} from 'class-validator';

class UpdateAcademyDto {
  @ApiPropertyOptional({ example: 'Academia Dragão BJJ — Luanda', description: 'Nome da academia' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'novo@dragaobjj.ao', description: 'Novo email de contacto' })
  @IsOptional()
  @IsEmail({}, {message:"Informe um email válido"})
  email?: string;

  @ApiPropertyOptional({ example: '+244923456789', description: 'Telefone actualizado' })
  @IsOptional()
  @IsString()
  @IsPhoneNumber("AO", { message: "Informe um número de telefone válido." })
  phone?: string;

  @ApiPropertyOptional({ example: 'Avenida 4 de Fevereiro, nº 12', description: 'Endereço actualizado' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Benguela', description: 'Província' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 'Lobito', description: 'Cidade ou município' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png', description: 'URL do logótipo' })
  @IsOptional()
  @IsString()
  logoUrl?: string;
  
  @IsOptional()
  password!: string;

  @IsOptional()
  @MinLength(8, { message: "A sua nova senha deve conter pelo menos 8 caracteres" })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: "A sua nova senha deve conter uma letra maiúscula, um número e um símbolo.",
    })
    newPassword?: string;
}

class UpdateAcademyRequestDto extends PartialType(UpdateAcademyDto){}
export { UpdateAcademyDto, UpdateAcademyRequestDto };