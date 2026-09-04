// Services/find-athelete.service.ts

import { Injectable, Inject, NotFoundException, HttpException,InternalServerErrorException, ForbiddenException, UnauthorizedException} from "@nestjs/common";
import { IAtheleRepositories } from "../Repositories/IAthlete-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";

@Injectable()
class GetAtheleteByIdService {
  constructor(
    @Inject(IAtheleRepositories)
    private readonly repository: IAtheleRepositories,
  ) {}

  async get(id: string, credentials?: { sub: string; academyId: string | null; role: Role},)
  {
    try {
      if(!id) throw new NotFoundException("Informe o(a) atleta.");
      const athelete = await this.repository.getAthleteDatas(id);
      if (!athelete) throw new NotFoundException("Atleta não encontrado(a).");
      // ✅ V-02 FIX: o service recebia as credenciais e nunca as usava —
      // qualquer conta autenticada, de qualquer academia, conseguia ler o
      // cadastro completo (documento, contacto de emergência, etc.) de
      // qualquer atleta da rede só por adivinhar/enumerar o id.
      if (athelete.academy.id !== credentials?.academyId && credentials?.role !== Role.CENTRAL)
      {
        throw new ForbiddenException("Você não tem permissão para ver os dados de um(a) atleta de outra academia.");
      }
      return { success: true, statusCode: 200, datas: athelete };
    } catch (error: any) {
      if(error instanceof HttpException)
        {
          throw error
        }
        console.error(error)
        throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
    }
  }

}

export { GetAtheleteByIdService };