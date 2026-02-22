// me.controller.ts
import {
  Controller,
  Get,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";

import { GetCurrenteUserService } from "../Services/get-current-user.service";
import { Roles } from "src/Common/Decorators/roles.decorator";
import { Role } from "../Guards/roles.enum";
import { RequestWithCredentials } from "../Interfaces/interface";

@ApiTags("Autenticação")
@ApiBearerAuth()
@Controller("auth")
class GetCurrentUserController {
  constructor(private readonly service: GetCurrenteUserService) {}

  @Roles(Role.ADMIN_DEV, Role.AFFILIATE_ADMIN, Role.CENTRAL)
  @Get("me")
  @ApiOperation({
    summary: "Obter dados do usuário autenticado",
    description:
      "Retorna as informações do usuário atualmente autenticado com base no token JWT.",
  })
  @ApiUnauthorizedResponse({
    description: "Token inválido ou não informado",
  })
  @ApiForbiddenResponse({
    description: "Usuário não tem permissão para acessar este recurso",
  })
  async me(@Req() req: RequestWithCredentials)
  {
    const id_user  = req.credentials?.sub as string;
    return this.service.execute(id_user);
  }
}

export { GetCurrentUserController };
