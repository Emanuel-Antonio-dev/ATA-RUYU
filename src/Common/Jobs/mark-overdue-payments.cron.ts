// subscription/cron/mark-overdue-payments.cron.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ISubscriptionPaymentRepository } from '../../Modules/Subscriptions/Repositories/ISubscriptions-payments.repositories';
import { IAcademiesRepositories } from 'src/Modules/Academies/Repositories/IAcademies-repositories';
import { SendEmailService } from 'src/Modules/Emails/send-email.service';

@Injectable()
export class MarkOverduePaymentsCron {
  private readonly logger = new Logger(MarkOverduePaymentsCron.name);

  constructor(
    @Inject(ISubscriptionPaymentRepository)
    private readonly paymentRepo: ISubscriptionPaymentRepository,
    @Inject(IAcademiesRepositories)
    private readonly academyRepo: IAcademiesRepositories,
    private readonly emailService: SendEmailService,
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

          // ✅ achado desta auditoria: nenhum aviso era dado antes da
          // suspensão (que acontece 7 dias depois de PAST_DUE, disparado
          // pelo cron seguinte). Um aviso agora dá tempo para regularizar
          // antes do acesso ser bloqueado.
          try {
            const academy = await this.academyRepo.findAcademyById({ action: 'OnlyBasicsDatas' }, payment.academyId);
            const email = academy?.account?.email;
            if (email) {
              await this.emailService.sendEmail(
                email,
                'Pagamento em atraso — Aliança do Tatame',
                `<h1>Pagamento em atraso</h1>
                 <p>O pagamento da academia <strong>${academy.name ?? ''}</strong>, com vencimento em ${new Date(payment.dueDate).toLocaleDateString('pt-AO')}, está em atraso.</p>
                 <p>Regularize a situação para evitar a suspensão do acesso à plataforma.</p>`,
              );
            }
          } catch (emailError) {
            this.logger.error(`Falha ao enviar email de atraso para o pagamento ${payment.id}`, emailError);
          }
        }),
      );

    } catch (error) {
      console.error(error);
    }
  }
}