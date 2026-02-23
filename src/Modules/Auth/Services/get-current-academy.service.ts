// get-me.service.ts

import {
  Injectable, NotFoundException, ForbiddenException,
  InternalServerErrorException, HttpException,
} from "@nestjs/common";
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";

@Injectable()
class GetCurrentAcademyService {
  constructor(private readonly repository: IAuthenticationRepositories) {}

  async execute(id: string) {
    try {
      const academy = await this.repository.getAcademy(id);

      if (!academy) {
        throw new NotFoundException("Academia não encontrada.");
      }

      // isActive está no account, não na academy
      if (!academy.account.isActive) {
        throw new ForbiddenException("Academia desativada.");
      }
      return { success: true, statusCode: 200, datas: academy };

    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error; // 👈 corrigido: era "errora"
      }
      console.error(error);
      throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.");
    }
  }
}

export { GetCurrentAcademyService };