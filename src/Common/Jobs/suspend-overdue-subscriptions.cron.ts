// subscription/cron/suspend-overdue-subscriptions.cron.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ISubscriptionRepository } from 'src/Modules/Subscriptions/Repositories/ISubscriptions-repositories';
import { IAcademiesRepositories } from 'src/Modules/Academies/Repositories/IAcademies-repositories';
import { PrismaService } from 'src/lib/prisma.service';
import { AcademyStatus } from 'generated/prisma/enums';

@Injectable()
export class SuspendOverdueSubscriptionsCron {
  private readonly logger = new Logger(SuspendOverdueSubscriptionsCron.name);
  private readonly GRACE_DAYS = 7;

  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,
    @Inject(IAcademiesRepositories)
    private readonly academyRepo: IAcademiesRepositories,
    private readonly prisma: PrismaService
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
          this.logger.warn(`Academia ${sub.academyId} suspensa (subscrição ${sub.id})`);
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