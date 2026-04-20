// Controllers/get-athlete-payments.controller.ts

import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';
import { GetAtheletePaymentsService } from '../Services/get-athele-payment-datas.service';

@ApiTags('Athletes/payments')
@ApiBearerAuth("accessToken")
@Controller('athlete-payments')
class GetAthletePaymentsController {
  constructor(private readonly service: GetAtheletePaymentsService) {}

  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Get(':athleteId')
  @ApiOperation({ summary: 'Listar pagamentos de um atleta' })
  @ApiQuery({ name: 'page',  type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista paginada de pagamentos' })
  @ApiResponse({ status: 401, description: 'Sem permissão para aceder ao recurso' })
  @ApiResponse({ status: 404, description: 'Atleta ou pagamentos não encontrados' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getPayments(
    @Param('athleteId') athleteId: string,
    @Req() req: RequestWithCredentials,
    @Query('page')  page?:  string,
    @Query('limit') limit?: string,
  ) {
    return this.service.get(
      {
        atheleId: athleteId,
        page:  page  ? Number(page)  : 1,
        limit: limit ? Number(limit) : 20,
      },
      req.credentials,
    );
  }
}

export { GetAthletePaymentsController };