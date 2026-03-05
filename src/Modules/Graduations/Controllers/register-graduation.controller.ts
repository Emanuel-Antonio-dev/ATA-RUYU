import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterGraduationService } from '../Services/register-graduation.service';
import { RegisterGraduationDto } from '../Dtos/create-graduation.dto';
import { JwtAuthGuard } from 'src/Modules/Auth/Guards/jwt-auth.guard';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Graduations')
@ApiBearerAuth('accessToken')
@Controller('graduations')
class RegisterGraduationController {
  constructor(
    private readonly registerGraduationService: RegisterGraduationService,
  ) {}

  @Post()
  @Roles(Role.CENTRAL, Role.AFFILIATE)
  @ApiOperation({
    summary: 'Registar graduação de atleta',
    description:
      'Regista uma nova graduação para um atleta. Pode representar mudança de faixa, de grau, ou ambos.',
  })
  @ApiResponse({ status: 201, description: 'Graduação registada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou regras de graduação violadas.' })
  @ApiResponse({ status: 404, description: 'Atleta ou academia não encontrada.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para registar graduações.' })
  @ApiResponse({ status: 500, description: 'Erro interno ao registar a graduação.' })
  async register(
    @Body() body: RegisterGraduationDto,
    @Req() req: RequestWithCredentials,
  ) {
    const credentials = req.credentials;
    return this.registerGraduationService.register(body, credentials);
  }
}

export { RegisterGraduationController };