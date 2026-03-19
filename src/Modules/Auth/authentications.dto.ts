import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength, IsString, IsPhoneNumber, IsOptional} from "class-validator";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";

class AutehticationsDto {
  @ApiProperty({ description: "E-mail do usuário", example: "aaaaaa@gmail.com" })
  @IsNotEmpty({ message: "Informe o email" })
  @IsEmail({}, { message: "Informe um email válido" })
  email!: string;

  @ApiProperty({ description: "Senha do usuário", example: "Atacentral@00" })
  @IsNotEmpty({ message: "Informe a sua password" })
  password!: string;
}

class ResetPasswordDto {
  @ApiProperty({ description: "Nova senha do usuário", example: "senha" })
  @IsNotEmpty({ message: "Informe a sua nova password" })
  @MinLength(8, { message: "A senha deve conter pelo menos 8 caracteres" })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: "A sua nova senha deve conter uma letra maiúscula, um número e um símbolo.",
  })
  newPassword!: string;
}

class AuthorizationQueryDto {
  @ApiProperty({
    description: "Token de autorização (JWT ou token temporário)",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsString({ message: "O token de autorização deve ser um texto válido." })
  @IsNotEmpty({ message: "O token de autorização é obrigatório." })
  @Matches(/^\S+$/, { message: "O token de autorização não pode conter espaços." })
  authorizationToken!: string;
}

class ValidateOtpDto {
  @ApiPropertyOptional({ description: "Email associada ao OTP", example: "teste@gmail.com" })
  @IsOptional()
  @IsString()
  @IsEmail({}, { message: "Informe um email válido." })
  email?: string;

  @ApiPropertyOptional({ description: "Número de telefone do usuário", example: "+244923456789" })
  @IsOptional()
  @IsPhoneNumber("AO", { message: "Informe um número de telefone válido." })
  phone_number?: string;

  @ApiProperty({ description: "Código OTP enviado ao utilizador", example: "123456" })
  @IsNotEmpty({ message: "Informe o código OTP." })
  @IsString()
  otp_code!: string;
}

class SendOtpDto {
  @ApiPropertyOptional({ description: "Email associada ao OTP", example: "teste@gmail.com" })
  @IsOptional()
  @IsString()
  @IsEmail({}, { message: "Informe um email válido." })
  email?: string;

  @ApiPropertyOptional({ description: "Número de telefone do usuário", example: "+244923456789" })
  @IsOptional()
  @IsPhoneNumber("AO", { message: "Informe um número de telefone válido." })
  phone_number?: string;
}

class RequestPasswordDto {
  @ApiProperty({ description: "E-mail do usuário", example: "email" })
  @IsNotEmpty({ message: "Informe o e-mail" })
  @IsEmail({}, { message: "Informe um e-mail válido" })
  email!: string;
}
export { AutehticationsDto, ResetPasswordDto, AuthorizationQueryDto, ValidateOtpDto, SendOtpDto, RequestPasswordDto }