// Services/find-academy.service.ts

import { Injectable, Inject, NotFoundException, HttpException,InternalServerErrorException, ForbiddenException} from "@nestjs/common";
import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { AcademyStatus } from "generated/prisma/client";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
@Injectable()
class GetAcademyService {
  constructor(
    @Inject(IAcademiesRepositories)
    private readonly repository: IAcademiesRepositories,
  ) {}

  async get(id: string, credentials?: { sub: string; role: Role},)
  {
    try {
      if(!id) throw new NotFoundException("ID da academia não informado.");
        const academy = await this.repository.findAcademyById({ action: "AllDatas" }, id);
        if (!academy) throw new NotFoundException("Academia não encontrada.");
        if (credentials?.sub !== id)
        {
          throw new ForbiddenException("Não tens permissão para editar esta academia.");
        }
        return { success: true, statusCode: 200, datas: academy };
    } catch (error: any) {
            if(error instanceof HttpException)
            {
                throw error
            }
            console.log(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
    }
  }

}

export { GetAcademyService };