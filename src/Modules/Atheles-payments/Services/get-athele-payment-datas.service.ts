// Services/find-athelete.service.ts

import { Injectable, Inject, NotFoundException, HttpException,InternalServerErrorException, ForbiddenException, UnauthorizedException} from "@nestjs/common";
import { IAtheleRepositories } from "../../Users/Atheles/Repositories/IAthlete-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { IAthelePaymentsRepositories } from "../Repositories/IAthlete-repositories";

@Injectable()
class GetAtheletePaymentsService {
  constructor(
    @Inject(IAtheleRepositories)
    private readonly repository: IAtheleRepositories,
    @Inject(IAthelePaymentsRepositories)
    private readonly paymentsRepository: IAthelePaymentsRepositories
  ) {}

  async get(filters:{limit: number, page: number, atheleId: string}, credentials?: { sub: string; academyId: string | null; role: Role},)
  {
    try {
      if(!filters.atheleId) throw new NotFoundException("Informe o(a) atleta.");
        const existsAthelete = await this.repository.getAthleteDatas(filters.atheleId);

        if (!existsAthelete) throw new NotFoundException("Atleta não encontrado(a).");
        // ✅ V-05 FIX: comparar contra `academyId` (não `sub`)
        if(existsAthelete.academy.id !== credentials?.academyId && credentials?.role !== Role.CENTRAL)
        {
            throw new UnauthorizedException("Você não tem permissão para acessar este recurso")
        }
        const result = await this.paymentsRepository.getAthelePayments(filters)
        if(result.data.length === 0)
        {
            throw new NotFoundException("Este athleta não possui nenhum pagamento de momento.")
        }
        return { success: true, statusCode: 200, ...result };
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

export { GetAtheletePaymentsService };