// Controllers/set-academy-status.controller.ts

import { Controller, Patch, Param, Body } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiBody,
} from '@nestjs/swagger';
import { AcademyStatus } from 'generated/prisma/client';
import { SetAcademyService } from '../Services/set-academy-status.service';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';

@ApiTags('Academies')
@ApiBearerAuth("accessToken")
@Controller('academies')
class SetAcademyStatusController {
  constructor(private readonly service: SetAcademyService) {}
  @Roles(Role.CENTRAL)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar o estado da academia' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type:    'string',
          enum:    Object.values(AcademyStatus),
          example: AcademyStatus.ACTIVE,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Estado alterado com sucesso' })
  @ApiResponse({ status: 400, description: 'Status inválido ou já aplicado' })
  @ApiResponse({ status: 404, description: 'Academia não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async set(
    @Param('id') id: string,
    @Body('status') status: AcademyStatus,
  ) {
    return this.service.set(id, status);
  }
}

export { SetAcademyStatusController };