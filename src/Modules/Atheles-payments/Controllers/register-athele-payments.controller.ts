// AthletePayment.controller.ts
import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreatePaymentDto }              from '../Dtos/create-payment.dto';
import { Role }                          from 'src/Modules/Auth/Guards/roles.enum';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { RegisterAthletePaymentsService } from '../Services/register-athele-payments.service';

@ApiTags('Athletes/payments')
@ApiBearerAuth()
@Controller('athlete-payments')
export class RegisterAthletePaymentController {
  constructor(
    private readonly registerPaymentService: RegisterAthletePaymentsService,
  ) {}

  @Post()
  @Roles(Role.AFFILIATE_ADMIN, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @ApiOperation({
    summary:     'Registar pagamento de mensalidade',
    description: 'Regista o pagamento de mensalidade de um atleta da academia autenticada.',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiNotFoundResponse({
    description: 'Atleta não encontrado(a).',
    schema: { example: { statusCode: 404, message: 'Atleta não encontrado(a).' } },
  })
  @ApiForbiddenResponse({
    description: 'Sem permissão para registar pagamentos de atletas de outra academia.',
    schema: { example: { statusCode: 403, message: 'Não tem permissão para registar o pagamento de um(a) atleta de outra academia.' } },
  })
  @ApiConflictResponse({
    description: 'Pagamento duplicado no mesmo mês.',
    schema: { example: { statusCode: 409, message: 'Já existe um pagamento registado para este(a) atleta no mês indicado.' } },
  })
  @ApiUnauthorizedResponse({
    description: 'Token inválido ou ausente.',
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  async register(@Body() body: CreatePaymentDto, @Req() req: any) {
    return this.registerPaymentService.register(body, req.user);
  }
}