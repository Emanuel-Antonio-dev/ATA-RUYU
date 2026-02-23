// Controllers/find-academy.controller.ts

import {
  Controller, Get, Param,
  Req
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { GetAcademyService } from '../Services/get-academy-datas.service';
import { PublicRoute } from 'src/Common/Decorators/public.decorator';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Academies')
@ApiBearerAuth("accessToken")
@Controller('academies')
class GetAcademyController {
  constructor(private readonly getAcademyService: GetAcademyService) {}

  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar academia por ID' })
  @ApiResponse({ status: 200, description: 'Academia encontrada' })
  @ApiResponse({ status: 404, description: 'Academia não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async get(@Param('id') id: string, @Req() req: RequestWithCredentials) {
    const credentials = req.credentials;
    return this.getAcademyService.get(id,credentials);
  }
}

export { GetAcademyController };