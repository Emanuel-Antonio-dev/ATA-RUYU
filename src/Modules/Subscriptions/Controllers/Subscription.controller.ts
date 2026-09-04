import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    HttpCode,
    Req
  } from '@nestjs/common';
  
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiBearerAuth,
  } from '@nestjs/swagger';
  // SERVICES  
  // DTO
import { RegisterSubscriptionPaymentService } from '../Services/register-payment.service';
import { ConfirmSubscriptionPaymentService } from '../Services/confirm-payment-subscription.service';
import { CancelSubscriptionService } from '../Services/cancel-payment-subscription.service';
import { RegisterSubscriptionPaymentDto } from '../Dtos/register-subscription-payment.dto';
import { ListOverduePaymentsService } from '../Services/list-ordue-payments.service';
import { GetSubscriptionPaymentHistoryService } from '../Services/find-payments-hystory.service';
import { RenewSubscriptionService } from '../Services/renew-subscription.service';
import { RegisterSubscriptionService } from '../Services/register-subscription.service';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

  @ApiTags('Subscriptions')
  @ApiBearerAuth('accessToken')
  @Controller('subscriptions')
  export class SubscriptionController {
    constructor(
      private readonly createSubscriptionService: RegisterSubscriptionService,
      private readonly registerPaymentService: RegisterSubscriptionPaymentService,
      private readonly confirmPaymentService: ConfirmSubscriptionPaymentService,
      private readonly cancelSubscriptionService: CancelSubscriptionService,
      private readonly renewSubscriptionService: RenewSubscriptionService,
      private readonly paymentHistoryService: GetSubscriptionPaymentHistoryService,
      private readonly overduePaymentsService: ListOverduePaymentsService,
    ) {}
  
    // ─────────────────────────────────────────────────────────────
    // REGISTER PAYMENT
    // ─────────────────────────────────────────────────────────────
    // ✅ V-03 FIX: era permitido a AFFILIATE/AFFILIATE_ADMIN — uma
    // afiliada conseguia auto-declarar-se paga. Passa a ser exclusivo de
    // quem confirma pagamentos (CENTRAL/ADMIN_DEV); o registo agora só
    // cria um pagamento PENDING (ver register-payment.service.ts).
    @Roles(Role.CENTRAL, Role.ADMIN_DEV)
    @Post('payments')
    @ApiOperation({ summary: 'Registar pagamento de subscrição' })
    @ApiBody({ type: RegisterSubscriptionPaymentDto })
    @ApiResponse({ status: 201, description: 'Pagamento registado com sucesso' })
    async registerPayment(@Body() dto: RegisterSubscriptionPaymentDto) {
      return this.registerPaymentService.execute(dto);
    }
    // ─────────────────────────────────────────────────────────────
    // CREATE SUBSCRIPTION
    // ─────────────────────────────────────────────────────────────

    @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
    @Post(':academyId')
    @ApiOperation({ summary: 'Criar subscrição para uma academia' })
    @ApiParam({ name: 'academyId', example: 'academy_123' })
    @ApiResponse({ status: 201, description: 'Subscrição criada com sucesso' })
    async create(@Param('academyId') academyId: string, @Req() req: RequestWithCredentials) {
      const credentials = req.credentials
      return this.createSubscriptionService.execute(academyId, credentials);
    }
  

    // ─────────────────────────────────────────────────────────────
    // CONFIRM PAYMENT
    // ─────────────────────────────────────────────────────────────
    @Roles(Role.ADMIN_DEV)
    @Patch('payments/:paymentId/confirm')
    @ApiOperation({ summary: 'Confirmar pagamento' })
    @ApiParam({ name: 'paymentId', example: 'payment_123' })
    @ApiResponse({ status: 200, description: 'Pagamento confirmado' })
    async confirmPayment(@Param('paymentId') paymentId: string) {
      return this.confirmPaymentService.execute(paymentId);
    }
  
    // ─────────────────────────────────────────────────────────────
    // CANCEL SUBSCRIPTION
    // ─────────────────────────────────────────────────────────────
  
    @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN, Role.ADMIN_DEV)
    @Patch(':subscriptionId/cancel')
    @ApiOperation({ summary: 'Cancelar subscrição' })
    @ApiParam({ name: 'subscriptionId', example: 'sub_123' })
    @ApiResponse({ status: 200, description: 'Subscrição cancelada' })
    async cancel(@Param('subscriptionId') subscriptionId: string, @Req() req: RequestWithCredentials) {
      // ✅ V-03 FIX: passa a validar posse dentro do service — antes
      // qualquer afiliada cancelava a subscrição de outra academia.
      return this.cancelSubscriptionService.execute(subscriptionId, req.credentials);
    }
  
    // ─────────────────────────────────────────────────────────────
    // RENEW SUBSCRIPTION
    // ─────────────────────────────────────────────────────────────
    // ✅ V-03 FIX: era permitido a AFFILIATE/AFFILIATE_ADMIN chamar em
    // ciclo, renovando a subscrição indefinidamente sem cobrar nada.
    // Passa a ser exclusivo de quem gere pagamentos (CENTRAL/ADMIN_DEV).
    @Roles(Role.CENTRAL, Role.ADMIN_DEV)
    @Patch(':subscriptionId/renew')
    @ApiOperation({ summary: 'Renovar subscrição' })
    @ApiParam({ name: 'subscriptionId', example: 'sub_123' })
    @ApiResponse({ status: 200, description: 'Subscrição renovada' })
    async renew(@Param('subscriptionId') subscriptionId: string) {
      return this.renewSubscriptionService.execute(subscriptionId);
    }
  
    // ─────────────────────────────────────────────────────────────
    // PAYMENT HISTORY
    // ─────────────────────────────────────────────────────────────
  
    @Roles(Role.ADMIN_DEV)
    @Get(':subscriptionId/payments')
    @ApiOperation({ summary: 'Listar histórico de pagamentos' })
    @ApiParam({ name: 'subscriptionId', example: 'sub_123' })
    @ApiResponse({ status: 200, description: 'Histórico retornado com sucesso' })
    async getHistory(@Param('subscriptionId') subscriptionId: string) {
      return this.paymentHistoryService.execute(subscriptionId);
    }
  
    // ─────────────────────────────────────────────────────────────
    // OVERDUE PAYMENTS
    // ─────────────────────────────────────────────────────────────
  
    @Roles(Role.ADMIN_DEV)
    @Get('payments/overdue')
    @ApiOperation({ summary: 'Listar pagamentos vencidos' })
    @ApiResponse({ status: 200, description: 'Pagamentos vencidos listados' })
    async getOverdue() {
      return this.overduePaymentsService.execute();
    }
  }