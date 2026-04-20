import { ISubscriptionRepository } from "../Repositories/ISubscriptions-repositories";
import { ConflictException, Inject, Injectable, HttpException, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException} from "@nestjs/common";
import {SUBSCRIPTION_AMOUNT_AOA, SUBSCRIPTION_CURRENCY} from "../contants"
import { ISubscriptionPaymentRepository } from "../Repositories/ISubscriptions-payments.repositories";
import { RegisterSubscriptionPaymentDto } from "../Dtos/register-subscription-payment.dto";
import { SubscriptionStatus } from "generated/prisma/enums";

@Injectable()
export class RegisterSubscriptionPaymentService {
  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,

    @Inject(ISubscriptionPaymentRepository)
    private readonly paymentRepo: ISubscriptionPaymentRepository,
  ) {}

  async execute(dto: RegisterSubscriptionPaymentDto)
  {
    try {
      const subscription = await this.subscriptionRepo.findById(dto.subscriptionId);

      if (!subscription)
    {
        throw new NotFoundException('Subscrição não encontrada.');
      }

      if (subscription.status === SubscriptionStatus.CANCELLED) {
        throw new BadRequestException('Subscrição cancelada não aceita pagamentos.');
      }

      const referenceMonth = new Date(dto.referenceMonth);
      const dueDate = new Date(dto.dueDate);

      if (dueDate < referenceMonth) {
        throw new BadRequestException('Data limite inválida.');
      }

      const existing = await this.paymentRepo.findBySubscriptionAndMonth(
        dto.subscriptionId,
        referenceMonth,
      );

      if (existing) {
        throw new ConflictException('Pagamento já registado para este mês.');
      }

      const paidAt = dto.paidAt ? new Date(dto.paidAt) : undefined;

      if (paidAt && paidAt > new Date()) {
        throw new BadRequestException('Data de pagamento inválida.');
      }

      const payment = await this.paymentRepo.register({
        subscriptionId: dto.subscriptionId,
        amount: SUBSCRIPTION_AMOUNT_AOA,
        currency: SUBSCRIPTION_CURRENCY,
        referenceMonth,
        dueDate,
        paidAt,
      });

      if (paidAt && subscription.status === SubscriptionStatus.PAST_DUE) {
        await this.subscriptionRepo.updateStatus(subscription.id, SubscriptionStatus.ACTIVE);
      }

      return {
        success: true,
        statusCode: 201,
        message: 'Pagamento registado com sucesso',
        data: payment,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Erro ao registar pagamento');
    }
  }
}