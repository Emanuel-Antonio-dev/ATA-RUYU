import { ISubscriptionRepository } from "../Repositories/ISubscriptions-repositories";
import { ConflictException, Inject, Injectable, HttpException, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException} from "@nestjs/common";
import { ISubscriptionPaymentRepository } from "../Repositories/ISubscriptions-payments.repositories";
import { SubscriptionStatus } from "generated/prisma/enums";

@Injectable()
export class ConfirmSubscriptionPaymentService {
  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,

    @Inject(ISubscriptionPaymentRepository)
    private readonly paymentRepo: ISubscriptionPaymentRepository,
  ) {}

  async execute(paymentId: string)
  {
    try {
      const payment = await this.paymentRepo.findById(paymentId);

      if (!payment) {
        throw new NotFoundException('Pagamento não encontrado.');
      }

      if (payment.status === 'PAID') {
        throw new BadRequestException('Pagamento já confirmado.');
      }

      const confirmed = await this.paymentRepo.markAsPaid(paymentId, new Date());

      const subscription = await this.subscriptionRepo.findById(payment.subscriptionId);
      if(!subscription)
      {
        throw new NotFoundException("Subscrição não encontrada.")
      }

      if (subscription.status === SubscriptionStatus.PAST_DUE) {
        const pending = await this.paymentRepo.findPendingBySubscription(subscription.id);

        if (pending.length === 0) {
          await this.subscriptionRepo.updateStatus(subscription.id, SubscriptionStatus.ACTIVE);
        }
      }
      return {
        success: true,
        statusCode: 200,
        message: 'Pagamento confirmado com sucesso',
        data: confirmed,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Ocorreu um erro interno, tente novamente.');
    }
  }
}