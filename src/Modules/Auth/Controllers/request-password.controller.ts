import { Body, Controller, Post } from "@nestjs/common";
import { RequestNewPasswordService } from "../Services/request-new-password.service";
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { RequestPasswordDto } from "../authentications.dto";
import { PublicRoute } from "src/Common/Decorators/public.decorator";

@ApiTags("Authentication")
@Controller("auth/password")
class RequestNewPasswordController {
  constructor(private readonly service: RequestNewPasswordService) {}

  @ApiOperation({
    summary: "Solicitar redefinição de senha",
    description:
      "Envia um email com link para redefinição de senha.",
  })
  @ApiBody({ type:  RequestPasswordDto})
  @ApiResponse({
    status: 200,
    description: "Pedido de redefinição enviado com sucesso.",
  })
  @ApiResponse({
    status: 400,
    description: "Email inválido ou não informado.",
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
  @Post("request")
  async requestNewPassword(@Body() data: RequestPasswordDto) {
    return this.service.requestNewPassword({email: data.email});
  }
}

export { RequestNewPasswordController };
