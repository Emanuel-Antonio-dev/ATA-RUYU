// Services/set-academy.service.ts

import {
  Injectable, Inject, NotFoundException, HttpException,
  InternalServerErrorException, BadRequestException,
} from "@nestjs/common";
import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { AcademyStatus } from "generated/prisma/client";
import { CacheService } from "src/Modules/Cache/cache.service";
import { SendEmailService } from "src/Modules/Emails/send-email.service";
import { renderAcademyApprovedEmail } from "src/Modules/Emails/Templates/academy-approved.template";
import { renderAcademyRejectedEmail } from "src/Modules/Emails/Templates/academy-rejected.template";

@Injectable()
class SetAcademyService {
  constructor(
    @Inject(IAcademiesRepositories)
    private readonly repository: IAcademiesRepositories,
    private readonly cacheService: CacheService,
    private readonly emailSender: SendEmailService,
  ) {}

  async set(id: string, status: AcademyStatus) {
    try {
      if (!id) throw new BadRequestException("ID da academia não informado.");

      if (!Object.values(AcademyStatus).includes(status)) {
        throw new BadRequestException("Status inválido.");
      }

      const academy = await this.repository.findAcademyById({ action: "OnlyBasicsDatas" }, id);
      if (!academy) throw new NotFoundException("Academia não encontrada.");

      if (academy.status === status) {
        throw new BadRequestException(`A academia já está com o status ${status}.`);
      }

      const updated = await this.repository.setAcademyStatus(id, status);

      const messages: Record<AcademyStatus, string> = {
        [AcademyStatus.ACTIVE]:    "Academia activada com sucesso.",
        [AcademyStatus.SUSPENDED]: "Academia suspensa com sucesso.",
        [AcademyStatus.REJECTED]:  "Academia rejeitada com sucesso.",
        [AcademyStatus.PENDING]:   "Academia colocada em pendente com sucesso.",
      };
      this.cacheService.invalidatePattern("academies:list:");
      this.cacheService.invalidatePattern("academy:");
      this.cacheService.invalidatePattern("dashboard:academy:");

      // ✅ achado desta auditoria: aprovar/rejeitar uma academia nunca
      // notificava ninguém — o responsável só descobria tentando fazer
      // login. Uma falha ao enviar o email não pode impedir a aprovação
      // em si de ficar registada.
      try {
        const email = academy.account?.email;
        if (email && status === AcademyStatus.ACTIVE) {
          const loginUrl = `${process.env.FRONTEND_URL}/login`;
          await this.emailSender.sendEmail(email, "A sua academia foi aprovada — ATA-RYU", renderAcademyApprovedEmail(academy.name, loginUrl));
        } else if (email && status === AcademyStatus.REJECTED) {
          await this.emailSender.sendEmail(email, "Actualização do seu registo — ATA-RYU", renderAcademyRejectedEmail(academy.name));
        }
      } catch (emailError) {
        console.error("[SetAcademyService] falha ao enviar email de notificação de status", emailError);
      }

      return {
        success:    true,
        statusCode: 200,
        message:    messages[status] ?? "Estado actualizado com sucesso.",
      };

    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.");
    }
  }
}

export { SetAcademyService };