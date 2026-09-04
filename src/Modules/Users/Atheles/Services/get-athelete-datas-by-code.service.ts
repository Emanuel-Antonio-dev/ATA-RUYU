// Services/find-athelete.service.ts

import { Injectable, Inject, NotFoundException, HttpException,InternalServerErrorException, ForbiddenException} from "@nestjs/common";
import { IAtheleRepositories } from "../Repositories/IAthlete-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";

@Injectable()
class GetAtheleteByAffiliateCodeService {
  constructor(
    @Inject(IAtheleRepositories)
    private readonly repository: IAtheleRepositories,
  ) {}

  async get(code: string, credentials?: { sub: string; academyId: string | null; role: Role},)
  {
    try {
      if(!code) throw new NotFoundException("Informe o(a) atleta.");
      const athelete = await this.repository.getAthleteDatasByAffiliateCode(code);
      if (!athelete) throw new NotFoundException("Atleta não encontrado(a).");
      // ✅ V-02 FIX: mesma falha do get-by-id — combinado com o espaço
      // pequeno de códigos de afiliação (ver B-07), permitia enumerar o
      // cadastro completo da rede em segundos.
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

export { GetAtheleteByAffiliateCodeService };