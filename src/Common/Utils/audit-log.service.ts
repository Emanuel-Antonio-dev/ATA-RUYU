import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/lib/prisma.service";

interface AuditLogParams {
  // Account.id de quem executou a acção (credentials.sub) — usado para
  // resolver o User.id correspondente, já que o modelo AuditLog liga a
  // `User`, não a `Account` (contas do tipo Academy — CENTRAL/AFFILIATE —
  // não têm um User.id; nesse caso fica só `academyId`).
  accountId?: string | null;
  academyId?: string | null;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
}

/**
 * ✅ Achado desta auditoria: o modelo `AuditLog` existe no schema desde o
 * início, mas nada no código alguma vez escrevia nele — não havia
 * nenhuma trilha de quem aprovou/suspendeu uma academia, confirmou um
 * pagamento, ou promoveu um utilizador. Instrumentado nas acções mais
 * sensíveis (aprovação/suspensão de academia, confirmação/cancelamento de
 * subscrição). Uma falha ao gravar o log nunca deve impedir a acção
 * principal de completar — por isso os erros são apanhados e só
 * registados, nunca propagados.
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: AuditLogParams): Promise<void> {
    try {
      let userId: string | null = null;
      if (params.accountId) {
        const user = await this.prisma.user.findUnique({
          where: { accountId: params.accountId },
          select: { id: true },
        });
        userId = user?.id ?? null;
      }

      await this.prisma.auditLog.create({
        data: {
          userId,
          academyId: params.academyId ?? null,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          before: params.before as any,
          after: params.after as any,
          ipAddress: params.ipAddress,
        },
      });
    } catch (error) {
      this.logger.error(`Falha ao registar audit log (${params.action} em ${params.entity})`, error as Error);
    }
  }
}
