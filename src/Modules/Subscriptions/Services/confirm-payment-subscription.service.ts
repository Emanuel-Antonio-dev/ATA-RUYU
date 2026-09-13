import { ISubscriptionRepository } from "../Repositories/ISubscriptions-repositories";
import { ConflictException, Inject, Injectable, HttpException, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException} from "@nestjs/common";
import { ISubscriptionPaymentRepository } from "../Repositories/ISubscriptions-payments.repositories";
import { SubscriptionStatus, AcademyStatus } from "generated/prisma/enums";
import { PrismaService } from "src/lib/prisma.service";
import { CacheService } from "src/Modules/Cache/cache.service";
import { AuditLogService } from "src/Common/Utils/audit-log.service";

@Injectable()
export class ConfirmSubscriptionPaymentService {
  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,

    @Inject(ISubscriptionPaymentRepository)
    private readonly paymentRepo: ISubscriptionPaymentRepository,

    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(paymentId: string, credentials?: { sub: string; academyId: string | null })
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

      // ✅ achado desta auditoria: confirmar um pagamento (acção
      // financeira, exclusiva de CENTRAL/ADMIN_DEV) nunca ficava
      // registada em nenhum lado.
      await this.auditLogService.log({
        accountId: credentials?.sub,
        academyId: credentials?.academyId,
        action: "subscription.payment.confirmed",
        entity: "SubscriptionPayment",
        entityId: paymentId,
        after: { amount: confirmed.amount, status: confirmed.status },
      });

      const subscription = await this.subscriptionRepo.findById(payment.subscriptionId);
      if(!subscription)
      {
        throw new NotFoundException("Subscrição não encontrada.")
      }

      // ✅ Achado desta auditoria: só tratava a reactivação a partir de
      // PAST_DUE. Uma academia já SUSPENDED (passou os 7 dias de graça do
      // cron `SuspendOverdueSubscriptionsCron`) que pagasse o que devia
      // ficava com o pagamento confirmado mas a subscrição — e a
      // academia — permanentemente presas em SUSPENDED, sem nenhum
      // caminho de volta a não ser intervenção manual na base de dados.
      if (subscription.status === SubscriptionStatus.PAST_DUE || subscription.status === SubscriptionStatus.SUSPENDED) {
        const pending = await this.paymentRepo.findPendingBySubscription(subscription.id);

        if (pending.length === 0) {
          const wasSuspended = subscription.status === SubscriptionStatus.SUSPENDED;
          await this.subscriptionRepo.updateStatus(subscription.id, SubscriptionStatus.ACTIVE);

          // a suspensão também tinha marcado a ACADEMIA como SUSPENDED
          // (não só a subscrição) — reverte isso também.
          if (wasSuspended) {
            await this.prisma.academy.update({
              where: { id: subscription.academyId },
              data: { status: AcademyStatus.ACTIVE },
            });
            // ✅ o SubscriptionStatusGuard cacheia o status por até 60s —
            // sem invalidar aqui, a academia reactivada continuaria
            // bloqueada até o cache expirar sozinho.
            this.cacheService.invalidateSubscription(subscription.academyId);
          }
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
      console.error(error);
      throw new InternalServerErrorException('Ocorreu um erro interno, tente novamente.');
    }
  }
}