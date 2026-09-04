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

      // ✅ V-03 FIX: este endpoint deixou de marcar o pagamento como PAID
      // e a subscrição como ACTIVE por si só — isso permitia a uma
      // afiliada suspensa por falta de pagamento reactivar-se sozinha,
      // sem qualquer verificação humana ou de gateway. Agora só regista o
      // pagamento como PENDING (valor por omissão no schema); confirmar o
      // pagamento (e, com isso, reactivar a subscrição) passa a ser
      // exclusivo de ConfirmSubscriptionPaymentService, que já só está
      // acessível a CENTRAL/ADMIN_DEV.
      // ✅ B-16 FIX: sem a env var definida, `Number(undefined)` é `NaN` e o
      // Prisma rejeitava a escrita do Decimal com um erro interno confuso.
      // Falha cedo, com uma mensagem clara, em vez de deixar chegar à BD.
      const subscriptionAmount = Number(process.env.SUBSCRIPTION_AMOUNT_AOA);
      const subscriptionCurrency = process.env.SUBSCRIPTION_CURRENCY;
      if (!process.env.SUBSCRIPTION_AMOUNT_AOA || Number.isNaN(subscriptionAmount)) {
        console.error('SUBSCRIPTION_AMOUNT_AOA não está definida ou não é um número válido.');
        throw new InternalServerErrorException('Configuração de subscrição em falta. Contacte o suporte.');
      }
      if (!subscriptionCurrency) {
        console.error('SUBSCRIPTION_CURRENCY não está definida.');
        throw new InternalServerErrorException('Configuração de subscrição em falta. Contacte o suporte.');
      }

      const payment = await this.paymentRepo.register({
        subscriptionId: dto.subscriptionId,

        amount: subscriptionAmount,

        currency: subscriptionCurrency,

        referenceMonth,
        dueDate,
      });

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
          paidAt: payment.paidAt ? payment.paidAt.toLocaleString() : null,
          createdAt: payment.createdAt,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error(error);

      throw new InternalServerErrorException(
        "Ocorreu um erro interno, tente novamente.",
      );
    }
  }
}