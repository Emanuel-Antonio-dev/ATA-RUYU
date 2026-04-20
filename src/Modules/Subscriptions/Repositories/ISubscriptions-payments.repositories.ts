// repositories/subscription-payment.repository.abstract.ts
import { SubscriptionPaymentStatus } from 'generated/prisma/enums';

export interface RegisterPaymentData {
  subscriptionId: string;
  amount: number;
  currency?: string;
  referenceMonth: Date;
  dueDate: Date;
  paidAt?: Date;
  status?: SubscriptionPaymentStatus;
}

export interface PendingOverduePayment {
  id: string;
  subscriptionId: string;
  dueDate: Date;
}

export abstract class ISubscriptionPaymentRepository {
  abstract findById(id: string): Promise<any | null>;
  abstract findBySubscriptionId(subscriptionId: string): Promise<any[]>;
  abstract findBySubscriptionAndMonth(subscriptionId: string, referenceMonth: Date): Promise<any | null>;
  abstract findOverdue(): Promise<any[]>;
  abstract findPendingOverdue(): Promise<PendingOverduePayment[]>;
  abstract findPendingBySubscription(subscriptionId: string): Promise<any[]>;
  abstract register(data: RegisterPaymentData): Promise<any>;
  abstract markAsPaid(id: string, paidAt: Date): Promise<any>;
  abstract markAsOverdue(id: string): Promise<any>;
  abstract updateStatus(id: string, status: SubscriptionPaymentStatus): Promise<any>;
}