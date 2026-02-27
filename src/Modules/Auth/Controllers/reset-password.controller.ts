import { Body, Controller, Post, Query } from "@nestjs/common";
import { ResetPasswordService } from "../Services/reset-password.service";
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { AuthorizationQueryDto, ResetPasswordDto } from "../authentications.dto";
import { PublicRoute } from "src/Common/Decorators/public.decorator";

@ApiTags("Authentication")
@Controller("auth/password")
class ResetPasswordController {
  constructor(private readonly service: ResetPasswordService ) {}

  @ApiOperation({
    summary: "Resetar a senha.",
    description:
      "Faz o reset de senha.",
  })
  @ApiBody({ type:  ResetPasswordDto})
  @ApiResponse({
    status: 200,
    description: "Senha alterada com sucesso.",
  })
  @ApiResponse({
    status: 400,
    description: "Senhas inválidas ou não informadas.",
  })
  @ApiResponse({
    status: 404,
    description: "Usuário não encontrado.",
  })
  @ApiResponse({
    status: 500,
    description: "Erro interno do servidor.",
  })
  @PublicRoute()
  @Post("reset")
  async resetPassword(@Body() data: ResetPasswordDto, @Query() authorization: AuthorizationQueryDto) {
    return this.service.ResetPassword({newPassword: data.newPassword}, authorization.authorizationToken);
  }
}

export { ResetPasswordController };
