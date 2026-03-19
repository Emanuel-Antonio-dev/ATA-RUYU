import {
  Controller,
  Patch,
  HttpCode,
  HttpStatus,
  Param,
  Body,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiProperty
} from '@nestjs/swagger';
import { SetGraduationStatusService } from '../Services/set-graduation-status.service';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';
import { IsEnum, IsNotEmpty } from 'class-validator';

class SetGraduationStatusDto {
  @ApiProperty({
    enum: ['APPROVED', 'NOT_APPROVED'],
    example: 'APPROVED',
    description: 'Status da graduação',
  })
  @IsEnum(['APPROVED', 'NOT_APPROVED'], { message: 'Status inválido' })
  @IsNotEmpty({ message: 'Informe o status da graduação' })
  status!: 'APPROVED' | 'NOT_APPROVED';
}

@ApiTags('Graduations')
@ApiBearerAuth('accessToken')
@Controller('graduations')
class SetGraduationStatusController {
  constructor(
    private readonly setGraduationStatusService: SetGraduationStatusService,
  ) {}

  @Put(':athleteId/status')
  @Roles(Role.CENTRAL, Role.AFFILIATE)
  @ApiOperation({
    summary: 'Aprovar ou negar graduação de um atleta',
    description: 'Permite ao mestre aprovar ou negar a graduação pendente de um atleta.',
  })
  @ApiParam({
    name: 'athleteId',
    description: 'ID do atleta',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: SetGraduationStatusDto })
  @ApiResponse({ status: 200, description: 'Status da graduação atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou atleta sem graduação pendente.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para alterar esta graduação.' })
  @ApiResponse({ status: 404, description: 'Atleta não encontrado.' })
  @ApiResponse({ status: 500, description: 'Erro interno ao atualizar graduação.' })
  async set(
    @Param('athleteId') athleteId: string,
    @Body() body: SetGraduationStatusDto,
    @Req() req: RequestWithCredentials,
  ) {
    const credentials = req?.credentials;
    return this.setGraduationStatusService.set(athleteId, body.status, credentials);
  }
}

export { SetGraduationStatusController };