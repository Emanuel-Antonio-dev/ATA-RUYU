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
import { RegisterGraduationReviewService } from '../Services/register-graduation-review.service';
import { RegisterGraduationReviewDto } from '../Dtos/create-graduation.dto';
import { JwtAuthGuard } from 'src/Modules/Auth/Guards/jwt-auth.guard';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Graduations')
@ApiBearerAuth('accessToken')
@Controller('graduations/reviews')
class RegisterGraduationReviewController {
  constructor(
    private readonly registerGraduationReviewService: RegisterGraduationReviewService,
  ) {}

  @Post()
  @Roles(Role.CENTRAL, Role.AFFILIATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registar avaliação de graduação',
    description:
      'Permite que um mestre ou instrutor submeta uma avaliação de recomendação de graduação para um atleta.',
  })
  @ApiResponse({ status: 201, description: 'Avaliação registada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Atleta não encontrado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para registar avaliações.' })
  @ApiResponse({ status: 500, description: 'Erro interno ao registar a avaliação.' })
  async register(
    @Body() body: RegisterGraduationReviewDto,
    @Req() req: RequestWithCredentials,
  ) {
    return this.registerGraduationReviewService.register(body);
  }
}

export { RegisterGraduationReviewController };