import { Response, Request } from "express";
import { Controller, Post, Req, Res } from "@nestjs/common";
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiCookieAuth,
} from "@nestjs/swagger";
import { RefreshTokenService } from "../Services/refreshToken.service";
import { PublicRoute } from "src/Common/Decorators/public.decorator";
import { access, stat } from "fs";

@ApiTags("Authentication")
@Controller("auth")
class RefreshTokenController {
  constructor(private readonly service: RefreshTokenService) {}

  @ApiOperation({
    summary: "Pedir novo token de acesso.",
    description:
      "Pede um novo token de acesso para o utilizador autenticado.",
  })
  @ApiCookieAuth("refreshToken")
  @ApiResponse({
    status: 200,
    description: "Novo token de acesso gerado com sucesso.",
    schema: {
      example: {
        statusCode: 200,
        success: true,
        message: "Novo token de acesso gerado com sucesso.",
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
  @Post("refreshToken")
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const { refreshToken } = request.cookies;
    const result = await this.service.refreshToken(refreshToken);

    // ✅ FIX crítico ligado à rotação de refresh token: o serviço passou a
    // devolver um refreshToken NOVO a cada chamada (ver refreshToken.service.ts),
    // mas este controller nunca actualizava o cookie — o cliente continuaria
    // a enviar o token antigo (já marcado como usado) no próximo pedido,
    // disparando a detecção de reutilização e revogando todas as sessões
    // logo no segundo refresh. O cookie tem de ser substituído aqui.
    response.cookie("refreshToken", result.datas.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    response.cookie("accessToken", result.datas.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    return {
      success: result.success,
      statusCode: result.statusCode,
      message: result.message,
      accessToken: result.datas.accessToken,
    }
  }
}

export { RefreshTokenController };
