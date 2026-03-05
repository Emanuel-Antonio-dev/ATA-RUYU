import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetAcademiesReportsService } from '../Services/get-academies-reports.service';
import { JwtAuthGuard } from 'src/Modules/Auth/Guards/jwt-auth.guard';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Academies')
@ApiBearerAuth("accessToken")
@Controller('/reports/academies')
class AcademiesReportsController {
  constructor(
    private readonly getAcademiesReportsService: GetAcademiesReportsService,
  ) {}

  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Relatório da academia',
    description:
      'Afiliada retorna as suas próprias métricas. Central retorna as suas métricas mais a visão global da rede.',
  })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para aceder a este relatório.' })
  @ApiResponse({ status: 404, description: 'Sem relatórios disponíveis de momento.' })
  @ApiResponse({ status: 500, description: 'Erro interno ao gerar o relatório.' })
  async get(@Req() req: RequestWithCredentials)
  {
    const credentials = req?.credentials
    return this.getAcademiesReportsService.get(credentials);
  }
}

export { AcademiesReportsController };