import { IsEmail, IsNotEmpty, IsOptional, Matches, MinLength, IsPhoneNumber} from "class-validator";
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class AccountDto {

    @ApiProperty({
        description: "E-mail do usuário",
        example: "usuario@example.com",
    })
    @IsNotEmpty({ message: "Informe o seu e-mail" })
    @IsEmail({}, { message: "Informe um e-mail válido" })
    email: string;

    @ApiProperty({
        description: "Senha do usuário",
        example: "SenhaForte@123",
    })
    @IsNotEmpty({ message: "Informe a sua password" })
    @MinLength(8, { message: "A senha deve conter pelo menos 8 caracteres" })
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message: "A senha deve conter uma letra maiúscula, um número e um símbolo.",
    })
    password: string;
    @ApiProperty({
        description: "Número de telefone do usuário",
        example: "+244923456789",
    })
    @IsNotEmpty({ message: "Informe o telefone de contato." })
    @IsPhoneNumber("AO", { message: "Informe um número de telefone válido." })
    phone_number: string;

    @ApiHideProperty()
    @IsOptional()
    @IsNotEmpty({ message: "Informe a sua nova password" })
    @MinLength(8, { message: "A senha deve conter pelo menos 8 caracteres" })
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message: "A sua nova senha deve conter uma letra maiúscula, um número e um símbolo.",
    })
    newPassword?: string;
}

export { AccountDto };
