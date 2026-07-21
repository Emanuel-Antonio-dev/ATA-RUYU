// src/Modules/Subscriptions/Services/start-trial-subscription.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "generated/prisma/client";
import { PrismaService } from "src/lib/prisma.service";

@Injectable()
class StartTrialSubscriptionService {
    private readonly logger = new Logger(StartTrialSubscriptionService.name);
    private readonly TRIAL_DAYS = 7;

    constructor(private readonly prisma: PrismaService) {}

    async execute(academyId: string, tx?: Omit<Prisma.TransactionClient, "$transaction">) {
        const client = tx ?? this.prisma;
        const now = new Date();
        const trialEnd = new Date(now.getTime() + this.TRIAL_DAYS * 24 * 60 * 60 * 1000);

        try {
            return await client.subscription.create({
                data: {
                    academyId,
                    status: "TRIALING",
                    amount: process.env.SUBSCRIPTION_AMOUNT_AOA,
                    currency: process.env.SUBSCRIPTION_CURRENCY,
                    currentPeriodStart: now,
                    currentPeriodEnd: trialEnd,
                },
            });
        } catch (error: any) {
            // P2002 = academyId já tinha subscription (corrida de dois primeiros logins simultâneos)
            if (error.code === "P2002") {
                this.logger.warn(`Trial já existia para academyId=${academyId}`);
                return client.subscription.findUniqueOrThrow({ where: { academyId } });
            }
            throw error;
        }
    }
}
export { StartTrialSubscriptionService };