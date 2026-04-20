// repositories/subscription.repository.interface.ts
import { RegisterSubscriptionDto } from '../Dtos/register-subscription.dto';
import { SubscriptionStatus } from 'generated/prisma/enums';

export interface RegisterSubscriptionData {
    academyId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    amount?: number;
    currency?: string;
  }
export abstract class ISubscriptionRepository {
  abstract findById(id: string): Promise<any>;
  abstract findByAcademyId(academyId: string): Promise<any>;
  abstract findAllByStatus(status: SubscriptionStatus): Promise<any[]>;
  abstract findExpired(): Promise<any[]>;
  abstract register(data: RegisterSubscriptionDto): Promise<any>;
  abstract updateStatus(id: string, status: SubscriptionStatus): Promise<any>;
  abstract renewPeriod(id: string, start: Date, end: Date): Promise<any>;
}
