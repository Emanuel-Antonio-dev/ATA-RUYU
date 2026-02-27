import { Response, Request } from "express";
import { LogoutService } from "../Services/logout.service";
import { Controller, Post, Req, Res } from "@nestjs/common";
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiCookieAuth,
} from "@nestjs/swagger";
import { PublicRoute } from "src/Common/Decorators/public.decorator";

@ApiTags("Authentication")
@Controller("auth")
class LogoutController {
  constructor(private readonly service: LogoutService) {}

  @ApiOperation({
    summary: "Encerrar sessão do utilizador",
    description:
      "Finaliza a sessão do utilizador autenticado, invalidando o refresh token e removendo o cookie de autenticação.",
  })
  @ApiCookieAuth("refreshToken")
  @ApiResponse({
    status: 200,
    description: "Sessão terminada com sucesso.",
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: "Sessão terminada com sucesso, volte sempre!",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Token inválido ou inexistente.",
  })
  @ApiResponse({
    status: 500,
    description: "Erro interno do servidor.",
  })
  @PublicRoute()
  @Post("logout")
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const { refreshToken } = request.cookies;

    response.clearCookie("refreshToken")

    return await this.service.logout(refreshToken);
  }
}

export { LogoutController };
