// Services/set-academy.service.ts

import {
  Injectable, Inject, NotFoundException, HttpException,
  InternalServerErrorException, BadRequestException,
} from "@nestjs/common";
import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { AcademyStatus } from "generated/prisma/client";
import { CacheService } from "src/Modules/Cache/cache.service";

@Injectable()
class SetAcademyService {
  constructor(
    @Inject(IAcademiesRepositories)
    private readonly repository: IAcademiesRepositories,
    private readonly cacheService: CacheService
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