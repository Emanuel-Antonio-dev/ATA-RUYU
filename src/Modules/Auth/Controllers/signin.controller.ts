import { SignInService } from "../Services/signin.service";
import { Body, Controller, Post, Res } from "@nestjs/common";
import { AutehticationsDto } from "../authentications.dto";
import { Response } from "express";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { PublicRoute } from "src/Common/Decorators/public.decorator";

@ApiTags("Authentication")
@Controller("auth")
export class SignInController {
  constructor(private readonly service: SignInService) {}

  @ApiOperation({ summary: "Autenticação do usuário." })
  @ApiBody({ type: AutehticationsDto })
  @ApiResponse({ status: 200, description: "Logado com sucesso." })
  @ApiResponse({ status: 400, description: "Campos inválidos ou em falta." })
  @ApiResponse({ status: 401, description: "Credenciais inválidas." })
  @ApiResponse({ status: 500, description: "Erro interno do servidor." })
  @PublicRoute()
  @Post("/signin")
  async signin(
    @Res({ passthrough: true }) response: Response,
    @Body() datas: AutehticationsDto
  ) {
    const result = await this.service.signin(datas);

    response.cookie("refreshToken", result.datas.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    response.cookie("accessToken", result.datas.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutos
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    return {
      success: result.success,
      statusCode: result.statusCode,
      message: result.message,
      accessToken: result.datas.accessToken,
    };
  }
}
