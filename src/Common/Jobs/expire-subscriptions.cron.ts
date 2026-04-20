// subscription/cron/expire-subscriptions.cron.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ISubscriptionPaymentRepository } from '../../Modules/Subscriptions/Repositories/ISubscriptions-payments.repositories';
import { SubscriptionStatus } from '../../../generated/prisma/enums';
import { ISubscriptionRepository } from 'src/Modules/Subscriptions/Repositories/ISubscriptions-repositories';

@Injectable()
export class ExpireSubscriptionsCron {
  private readonly logger = new Logger(ExpireSubscriptionsCron.name);

  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async execute() {
    try {
      this.logger.log('[CRON] Verificando subscrições expiradas...');

      const expired = await this.subscriptionRepo.findExpired();

      if (expired.length === 0) {
        this.logger.log('Nenhuma subscrição expirada');
        return;
      }

      await Promise.all(
        expired.map(async (sub) => {
          await this.subscriptionRepo.updateStatus(
            sub.id,
            SubscriptionStatus.PAST_DUE,
          );

          this.logger.warn(`Subscrição ${sub.id} movida para PAST_DUE`);
        }),
      );

    } catch (error) {
      console.log(error);
    }
  }
}