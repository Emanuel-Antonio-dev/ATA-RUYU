// Services/set-academy.service.ts

import {
  Injectable, Inject, NotFoundException, HttpException,
  InternalServerErrorException, BadRequestException,
} from "@nestjs/common";
import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { AcademyStatus } from "generated/prisma/client";

@Injectable()
class SetAcademyService {
  constructor(
    @Inject(IAcademiesRepositories)
    private readonly repository: IAcademiesRepositories,
  ) {}

  async set(id: string, status: AcademyStatus) {
    try {
      if (!id) throw new BadRequestException("ID da academia não informado."); // 👈 BadRequest em vez de NotFound

      if (!Object.values(AcademyStatus).includes(status)) {
        throw new BadRequestException("Status inválido.");
      }

      const academy = await this.repository.findAcademyById({ action: "OnlyBasicsDatas" }, id); // 👈 OnlyBasicsDatas — não precisas de todos os dados só para verificar existência
      if (!academy) throw new NotFoundException("Academia não encontrada.");

      if (academy.status === status) {
        throw new BadRequestException(`A academia já está com o status ${status}.`);
      }

      const updated = await this.repository.setAcademyStatus(id, status); // 👈 guarda o resultado

      const messages: Record<AcademyStatus, string> = {
        [AcademyStatus.ACTIVE]:    "Academia activada com sucesso.",
        [AcademyStatus.SUSPENDED]: "Academia suspensa com sucesso.",
        [AcademyStatus.REJECTED]:  "Academia rejeitada com sucesso.",
        [AcademyStatus.PENDING]:   "Academia colocada em pendente com sucesso.",
      };

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