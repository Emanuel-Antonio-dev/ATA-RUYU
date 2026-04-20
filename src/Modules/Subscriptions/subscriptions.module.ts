import { Module } from '@nestjs/common';
import { SubscriptionController } from './Controllers/Subscription.controller';
import { PrismaSubscriptionPaymentRepository } from './Repositories/Prisma/prisma-subscriptions-payments.repositories';
import { ISubscriptionPaymentRepository } from './Repositories/ISubscriptions-payments.repositories';
import { PrismaSubscriptionRepository } from './Repositories/Prisma/prisma-subscriptions-repositories';
import { ISubscriptionRepository } from './Repositories/ISubscriptions-repositories';
import { RegisterSubscriptionPaymentService } from './Services/register-payment.service';
import { RegisterSubscriptionService } from './Services/register-subscription.service';
import { ListOverduePaymentsService } from './Services/list-ordue-payments.service';
import { ConfirmSubscriptionPaymentService } from './Services/confirm-payment-subscription.service';
import { RenewSubscriptionService } from './Services/renew-subscription.service';
import { CancelSubscriptionService } from './Services/cancel-payment-subscription.service';
import { GetSubscriptionPaymentHistoryService } from './Services/find-payments-hystory.service';
import { PrismaService } from 'src/lib/prisma.service';

@Module({
  imports: [],
  controllers: [SubscriptionController],
  providers: [
    {
      useClass: PrismaSubscriptionPaymentRepository,
      provide: ISubscriptionPaymentRepository
    },
    {
      useClass: PrismaSubscriptionRepository,
      provide: ISubscriptionRepository
    },
    PrismaService,
    RegisterSubscriptionPaymentService,
    RegisterSubscriptionService,
    ListOverduePaymentsService,
    ConfirmSubscriptionPaymentService,
    RenewSubscriptionService,
    CancelSubscriptionService,
    GetSubscriptionPaymentHistoryService
  ],
})
export class SubscriptionsModule {}
