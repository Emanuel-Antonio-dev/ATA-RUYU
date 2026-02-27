// Controllers/resume-attendance.controller.ts

import { Controller, Get, Query, Req } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { ResumeAttendanceService } from '../Service/resume-attendences.service';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Attendance')
@ApiBearerAuth("accessToken")
@Controller('attendance')
class ResumeAttendanceController {
  constructor(private readonly service: ResumeAttendanceService) {}

  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Get('resume')
  @ApiOperation({
    summary:     'Resumo de presenças por data',
    description: 'Retorna o total de presentes e ausentes numa data específica.',
  })
  @ApiQuery({
    name:        'date',
    type:        String,
    required:    true,
    example:     '2026-02-25',
    description: 'Data da aula no formato YYYY-MM-DD',
  })
  @ApiResponse({ status: 200, description: 'Resumo de presenças' })
  @ApiResponse({ status: 400, description: 'Data inválida ou não informada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async resume(
    @Query('date') date: string,
    @Req() req: RequestWithCredentials,
  ) {
    return this.service.execute(date, req.credentials);
  }
}

export { ResumeAttendanceController };