// Controllers/mark-attendance.controller.ts

import { Controller, Post, Body, Req } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { MarkAttendanceService } from '../Service/mark-attendance.service';
import { MarkAttendanceDto } from '../Dtos/mark-attendance.dto';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Attendance')
@ApiBearerAuth("accessToken")
@Controller('attendance')
class MarkAttendanceController {
  constructor(private readonly service: MarkAttendanceService) {}

  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Post()
  @ApiOperation({
    summary:     'Marcar presença de um atleta',
    description: 'Regista a presença ou ausência de um atleta numa aula.',
  })

  @ApiResponse({ status: 201, description: 'Presença marcada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Atleta ou academia não encontrado/a' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async mark(
    @Body() body: MarkAttendanceDto,
    @Req() req: RequestWithCredentials,
  ) {
    const credentials = req.credentials
    return this.service.markAttendance(body, credentials);
  }
}

export { MarkAttendanceController };