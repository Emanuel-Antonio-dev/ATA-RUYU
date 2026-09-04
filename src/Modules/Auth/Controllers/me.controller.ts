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

import { GetCurrentAcademyService } from "../Services/get-current-academy.service";
import { Roles } from "src/Common/Decorators/roles.decorator";
import { Role } from "../Guards/roles.enum";
import { RequestWithCredentials } from "../Interfaces/interface";

@ApiTags("Authentication")
@ApiBearerAuth("accessToken")
@Controller("auth")
class GetCurrentAcademyController {
  constructor(private readonly service: GetCurrentAcademyService) {}

  @Roles(Role.ADMIN_DEV, Role.AFFILIATE_ADMIN, Role.CENTRAL, Role.AFFILIATE)
  @Get("me")
  @ApiOperation({
    summary: "Obter dados da academia autenticada",
    description:
      "Retorna as informações da academia atualmente autenticada com base no token JWT.",
  })
  @ApiUnauthorizedResponse({
    description: "Token inválido ou não informado",
  })
  @ApiForbiddenResponse({
    description: "Academia não tem permissão para acessar este recurso",
  })
  async me(@Req() req: RequestWithCredentials)
  {
    // ✅ V-05 FIX: `sub` é agora sempre o Account.id — este endpoint
    // precisa do Academy.id, que viaja na claim `academyId`.
    const id  = req.credentials?.academyId as string;
    return this.service.execute(id);
  }
}

export { GetCurrentAcademyController };
