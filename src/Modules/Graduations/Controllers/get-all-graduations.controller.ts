import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetAllGraduationsService } from '../Services/get-all-graduations.service';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Graduations')
@ApiBearerAuth('accessToken')
@Controller('graduations')
class GetAllGraduationsController {
  constructor(
    private readonly getAllGraduationsService: GetAllGraduationsService,
  ) {}

  @Get()
  @Roles(Role.CENTRAL, Role.AFFILIATE)
  @ApiOperation({
    summary: 'Listar todas as graduações da academia',
    description:
      'Retorna todas as graduações da academia autenticada, incluindo dados do atleta e avaliações.',
  })
  @ApiResponse({ status: 200, description: 'Graduações listadas com sucesso.' })
  @ApiResponse({ status: 404, description: 'Nenhuma graduação encontrada.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para listar graduações.' })
  @ApiResponse({ status: 500, description: 'Erro interno ao listar graduações.' })
  async getAll(@Req() req: RequestWithCredentials) {
    const credentials = req?.credentials;
    // ✅ V-05 FIX: `sub` é agora sempre o Account.id — este endpoint precisa
    // do tenant (Academy.id), que viaja na claim `academyId`.
    return this.getAllGraduationsService.getAll(credentials?.academyId!, credentials);
  }
}

export { GetAllGraduationsController };