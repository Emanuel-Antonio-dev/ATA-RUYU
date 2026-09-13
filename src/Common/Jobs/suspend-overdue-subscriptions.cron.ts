// subscription/cron/suspend-overdue-subscriptions.cron.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ISubscriptionRepository } from 'src/Modules/Subscriptions/Repositories/ISubscriptions-repositories';
import { IAcademiesRepositories } from 'src/Modules/Academies/Repositories/IAcademies-repositories';
import { PrismaService } from 'src/lib/prisma.service';
import { AcademyStatus } from 'generated/prisma/enums';
import { SendEmailService } from 'src/Modules/Emails/send-email.service';
import { CacheService } from 'src/Modules/Cache/cache.service';

@Injectable()
export class SuspendOverdueSubscriptionsCron {
  private readonly logger = new Logger(SuspendOverdueSubscriptionsCron.name);
  private readonly GRACE_DAYS = 7;

  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,
    @Inject(IAcademiesRepositories)
    private readonly academyRepo: IAcademiesRepositories,
    private readonly prisma: PrismaService,
    private readonly emailService: SendEmailService,
    // ✅ achado desta auditoria: o SubscriptionStatusGuard cacheia o
    // status da academia por até 60s — sem invalidar aqui, uma academia
    // suspensa por este cron continuaria a passar no guard até o cache
    // expirar sozinho.
    private readonly cacheService: CacheService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM) // depois dos dois anteriores
  async execute() {
    try {
      this.logger.log('[CRON] Verificando subscrições a suspender...');

      const graceLimit = new Date(Date.now() - this.GRACE_DAYS * 24 * 60 * 60 * 1000);
      const toSuspend = await this.subscriptionRepo.findPastDueSince(graceLimit);

      if (toSuspend.length === 0) {
        this.logger.log('Nenhuma subscrição a suspender');
        return;
      }

      const results = await Promise.allSettled(
        toSuspend.map(async (sub) => {
          await this.subscriptionRepo.updateStatus(sub.id, 'SUSPENDED');
          await this.prisma.academy.update({
            where: { id: sub.academyId },
            data: { status: AcademyStatus.SUSPENDED },
          });
          this.cacheService.invalidateSubscription(sub.academyId);
          this.logger.warn(`Academia ${sub.academyId} suspensa (subscrição ${sub.id})`);

          // ✅ achado desta auditoria: a academia era suspensa em silêncio —
          // a única forma de descobrir era tentar fazer login e ver a
          // sessão a falhar, sem nenhuma explicação. Notifica por email.
          try {
            const academy = await this.academyRepo.findAcademyById({ action: 'OnlyBasicsDatas' }, sub.academyId);
            const email = academy?.account?.email;
            if (email) {
              await this.emailService.sendEmail(
                email,
                'A sua academia foi suspensa — Aliança do Tatame',
                `<h1>A sua academia foi suspensa</h1>
                 <p>A subscrição da academia <strong>${academy.name ?? ''}</strong> foi suspensa por falta de pagamento há mais de ${this.GRACE_DAYS} dias.</p>
                 <p>O acesso à plataforma fica bloqueado até regularizar a situação. Contacte a Central para efectuar o pagamento e reactivar a conta.</p>`,
              );
            }
          } catch (emailError) {
            // uma falha ao notificar não pode impedir a suspensão em si
            this.logger.error(`Falha ao enviar email de suspensão para a academia ${sub.academyId}`, emailError);
          }
        }),
      );

      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        this.logger.error(`${failed.length} suspensões falharam`, failed);
      }
    } catch (error) {
      this.logger.error('[CRON] Falha ao suspender subscrições', error);
    }
  }
}