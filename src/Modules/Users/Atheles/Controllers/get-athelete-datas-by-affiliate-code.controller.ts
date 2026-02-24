// Controllers/find-academy.controller.ts

import {
  Controller, Get, Param,
  Req
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { GetAtheleteService } from '../Services/get-athelete-datas-by-affiliate-code.service';
import { GetAtheleteByAffiliateCodeService } from '../Services/get-athelete-datas.service';
import { PublicRoute } from 'src/Common/Decorators/public.decorator';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Athletes')
@ApiBearerAuth("accessToken")
@Controller('athletes')
class GetAtheleteByAffiliateCodeController {
  constructor(private readonly getAtheleteService: GetAtheleteByAffiliateCodeService) {}

  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Get(':code')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar atlete por código de afiliação' })
  @ApiResponse({ status: 200, description: 'atlete encontrada' })
  @ApiResponse({ status: 404, description: 'atlete não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async get(@Param('code') code: string, @Req() req: RequestWithCredentials) {
    const credentials = req.credentials;
    return this.getAtheleteService.get(code,credentials);
  }
}

export { GetAtheleteByAffiliateCodeController };