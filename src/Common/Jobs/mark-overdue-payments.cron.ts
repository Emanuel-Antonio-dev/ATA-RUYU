// subscription/cron/mark-overdue-payments.cron.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ISubscriptionPaymentRepository } from '../../Modules/Subscriptions/Repositories/ISubscriptions-payments.repositories';

@Injectable()
export class MarkOverduePaymentsCron {
  private readonly logger = new Logger(MarkOverduePaymentsCron.name);

  constructor(
    @Inject(ISubscriptionPaymentRepository)
    private readonly paymentRepo: ISubscriptionPaymentRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async execute() {
    try {
      this.logger.log('[CRON] Verificando pagamentos vencidos...');

      const candidates = await this.paymentRepo.findPendingOverdue();

      if (candidates.length === 0) {
        this.logger.log('Nenhum pagamento vencido encontrado');
        return;
      }

      await Promise.all(
        candidates.map(async (payment) => {
          await this.paymentRepo.markAsOverdue(payment.id);

          this.logger.warn(`Pagamento ${payment.id} marcado como OVERDUE`);
        }),
      );

    } catch (error) {
      console.log(error);
    }
  }
}