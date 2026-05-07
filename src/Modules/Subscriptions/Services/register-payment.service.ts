import { ISubscriptionRepository } from "../Repositories/ISubscriptions-repositories";
import { ConflictException, Inject, Injectable, HttpException, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException} from "@nestjs/common";
import { ISubscriptionPaymentRepository } from "../Repositories/ISubscriptions-payments.repositories";
import { RegisterSubscriptionPaymentDto } from "../Dtos/register-subscription-payment.dto";
import { SubscriptionStatus } from "generated/prisma/enums";
import "dotenv/config"
@Injectable()
export class RegisterSubscriptionPaymentService {
  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,

    @Inject(ISubscriptionPaymentRepository)
    private readonly paymentRepo: ISubscriptionPaymentRepository,
  ) {}

  async execute(dto: RegisterSubscriptionPaymentDto) {
    try {
      const subscription = await this.subscriptionRepo.findById(
        dto.subscriptionId,
      );

      if (!subscription) {
        throw new NotFoundException(
          "Subscrição não encontrada.",
        );
      }

      if (
        subscription.status === SubscriptionStatus.CANCELLED
      ) {
        throw new BadRequestException(
          "Subscrição cancelada não aceita pagamentos.",
        );
      }

      const referenceMonth =
        subscription.currentPeriodStart;

      const dueDate =
        subscription.currentPeriodEnd;

      const existing =
        await this.paymentRepo.findBySubscriptionAndMonth(
          dto.subscriptionId,
          referenceMonth,
        );

      if (existing) {
        throw new ConflictException(
          "Pagamento já registado para este período.",
        );
      }

      const payment = await this.paymentRepo.register({
        subscriptionId: dto.subscriptionId,

        amount: Number(
          process.env.SUBSCRIPTION_AMOUNT_AOA,
        ),

        currency:
          process.env.SUBSCRIPTION_CURRENCY!,

        referenceMonth,
        dueDate,

        paidAt: new Date(),
      });

      if (
        subscription.status ===
        SubscriptionStatus.PAST_DUE
      ) {
        await this.subscriptionRepo.updateStatus(
          subscription.id,
          SubscriptionStatus.ACTIVE,
        );
      }

      return {
        success: true,
        statusCode: 201,
        message:
          "Pagamento registado com sucesso",
        data:{
          id: payment.id,
          subscriptionId: payment.subscriptionId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          referenceMonth: payment.referenceMonth.toLocaleString(),
          dueDate: payment.dueDate.toLocaleString(),
          paidAt: payment.paidAt.toLocaleString(),
          createdAt: payment.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.log(error);

      throw new InternalServerErrorException(
        "Ocorreu um erro interno, tente novamente.",
      );
    }
  }
}