// Services/get-all-athletes.service.ts

import {
  Injectable, Inject, HttpException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { IAtheleRepositories } from "../Repositories/IAthlete-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";

@Injectable()
class GetAllAthletesService {
  constructor(
    @Inject(IAtheleRepositories)
    private readonly repository: IAtheleRepositories,
  ) {}

  async execute(
    filters: { page: number; limit: number,academyId?:string;affiliateCode?: string;},
    credentials?: { sub: string; role: Role; academyId: string | null },
  ) {
    try {
      // ✅ V-02 FIX: esta lista devolvia TODOS os atletas da plataforma,
      // para qualquer conta autenticada — `academyId`/`affiliateCode` eram
      // recebidos mas nunca chegavam a ser passados ao repositório, e não
      // havia nenhuma derivação a partir do token. Agora: a CENTRAL pode
      // escolher a academia (ou ver todas, omitindo o parâmetro); qualquer
      // outro papel fica sempre preso à sua própria academia, ignorando o
      // que vier na query.
      const scopeAcademyId = credentials?.role === Role.CENTRAL
        ? (filters.academyId ?? undefined)
        : (credentials?.academyId ?? undefined);

      const result = await this.repository.getAllAtheles({
        page:  filters.page,
        limit: filters.limit,
        academyId: scopeAcademyId,
        affiliateCode: filters.affiliateCode,
      });
      if(result.data.length === 0)
      {
        throw new NotFoundException("De momento ainda não existem atletas")
      }
      return {
        success:    true,
        statusCode: 200,
        ...result,
      };

    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.");
    }
  }
}

export { GetAllAthletesService };