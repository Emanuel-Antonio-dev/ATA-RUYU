// repositories/prisma-subscription-payment.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma.service';
import { RegisterPaymentData, ISubscriptionPaymentRepository, PendingOverduePayment } from '../ISubscriptions-payments.repositories';
import { SubscriptionPaymentStatus } from 'generated/prisma/enums';

@Injectable()
export class PrismaSubscriptionPaymentRepository implements ISubscriptionPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.subscriptionPayment.findUnique({ where: { id } });
  }

  findBySubscriptionId(subscriptionId: string) {
    return this.prisma.subscriptionPayment.findMany({
      where: { subscriptionId },
      orderBy: { referenceMonth: 'desc' },
    });
  }

  findBySubscriptionAndMonth(subscriptionId: string, referenceMonth: Date) {
    const start = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth(), 1);
    const end = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth() + 1, 1);

    return this.prisma.subscriptionPayment.findFirst({
      where: {
        subscriptionId,
        referenceMonth: { gte: start, lt: end },
      },
    });
  }

  findOverdue() {
    return this.prisma.subscriptionPayment.findMany({
      where: { status: SubscriptionPaymentStatus.OVERDUE },
      include: {
        subscription: {
          include: { academy: { select: { id: true, name: true } } },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findPendingOverdue(): Promise<PendingOverduePayment[]> {
    return this.prisma.subscriptionPayment.findMany({
      where: {
        status: SubscriptionPaymentStatus.PENDING,
        dueDate: { lt: new Date() },
      },
      select: {
        id: true,
        subscriptionId: true,
        dueDate: true,
      },
    });
  }

  findPendingBySubscription(subscriptionId: string) {
    return this.prisma.subscriptionPayment.findMany({
      where: {
        subscriptionId,
        status: SubscriptionPaymentStatus.PENDING,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  register(data: RegisterPaymentData) {
    return this.prisma.subscriptionPayment.create({
      data: {
        subscriptionId: data.subscriptionId,
        amount: data.amount,
        currency: data.currency ?? 'AOA',
        referenceMonth: data.referenceMonth,
        dueDate: data.dueDate,
        paidAt: data.paidAt,
        status: "PENDING"
      },
    });
  }

  markAsPaid(id: string, paidAt: Date) {
    return this.prisma.subscriptionPayment.update({
      where: { id },
      data: { status: SubscriptionPaymentStatus.PAID, paidAt },
    });
  }

  markAsOverdue(id: string) {
    return this.prisma.subscriptionPayment.update({
      where: { id },
      data: { status: SubscriptionPaymentStatus.OVERDUE },
    });
  }

  updateStatus(id: string, status: SubscriptionPaymentStatus) {
    return this.prisma.subscriptionPayment.update({
      where: { id },
      data: { status },
    });
  }
}