import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    HttpCode,
  } from '@nestjs/common';
  
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
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

  @ApiTags('Subscriptions')
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
    // CREATE SUBSCRIPTION
    // ─────────────────────────────────────────────────────────────
  
    @Post(':academyId')
    @ApiOperation({ summary: 'Criar subscrição para uma academia' })
    @ApiParam({ name: 'academyId', example: 'academy_123' })
    @ApiResponse({ status: 201, description: 'Subscrição criada com sucesso' })
    async create(@Param('academyId') academyId: string) {
      return this.createSubscriptionService.execute(academyId);
    }
  
    // ─────────────────────────────────────────────────────────────
    // REGISTER PAYMENT
    // ─────────────────────────────────────────────────────────────
  
    @Post('payments')
    @ApiOperation({ summary: 'Registar pagamento de subscrição' })
    @ApiBody({ type: RegisterSubscriptionPaymentDto })
    @ApiResponse({ status: 201, description: 'Pagamento registado com sucesso' })
    async registerPayment(@Body() dto: RegisterSubscriptionPaymentDto) {
      return this.registerPaymentService.execute(dto);
    }
  
    // ─────────────────────────────────────────────────────────────
    // CONFIRM PAYMENT
    // ─────────────────────────────────────────────────────────────
  
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
  
    @Patch(':subscriptionId/cancel')
    @ApiOperation({ summary: 'Cancelar subscrição' })
    @ApiParam({ name: 'subscriptionId', example: 'sub_123' })
    @ApiResponse({ status: 200, description: 'Subscrição cancelada' })
    async cancel(@Param('subscriptionId') subscriptionId: string) {
      return this.cancelSubscriptionService.execute(subscriptionId);
    }
  
    // ─────────────────────────────────────────────────────────────
    // RENEW SUBSCRIPTION
    // ─────────────────────────────────────────────────────────────
  
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
  
    @Get('payments/overdue')
    @ApiOperation({ summary: 'Listar pagamentos vencidos' })
    @ApiResponse({ status: 200, description: 'Pagamentos vencidos listados' })
    async getOverdue() {
      return this.overduePaymentsService.execute();
    }
  }