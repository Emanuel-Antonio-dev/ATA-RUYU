// repositories/prisma-subscription.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { ISubscriptionRepository, RegisterSubscriptionData } from '../ISubscriptions-repositories';
import { SubscriptionStatus } from 'generated/prisma/enums';

@Injectable()
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  
    constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: { payments: { orderBy: { referenceMonth: 'desc' } } },
    });
  }

  findByAcademyId(academyId: string) {
    return this.prisma.subscription.findUnique({
      where: { academyId },
      include: { payments: { orderBy: { referenceMonth: 'desc' } } },
    });
  }

  findAllByStatus(status: SubscriptionStatus) {
    return this.prisma.subscription.findMany({
      where: { status },
      include: { academy: { select: { id: true, name: true } } },
    });
  }

  findExpired() {
    return this.prisma.subscription.findMany({
      where: {
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE] },
        currentPeriodEnd: { lt: new Date() },
      },
    });
  }

register(data: RegisterSubscriptionData) {
  return this.prisma.subscription.create({
    data: {
      academyId: data.academyId,
      currentPeriodStart: new Date(),

      currentPeriodEnd: data.currentPeriodEnd
        ? new Date(data.currentPeriodEnd)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

      amount: data.amount ?? 35_500,
      currency: data.currency ?? "AOA",
      status: SubscriptionStatus.ACTIVE,
    },
  });
}

  updateStatus(id: string, status: SubscriptionStatus) {
    return this.prisma.subscription.update({
      where: { id },
      data: { status },
    });
  }

  renewPeriod(id: string, start: Date, end: Date) {
    return this.prisma.subscription.update({
      where: { id },
      data: {
        currentPeriodStart: start,
        currentPeriodEnd: end,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }
}