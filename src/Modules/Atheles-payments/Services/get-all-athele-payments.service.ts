// Services/get-all-athletes.service.ts

import {
  Injectable, Inject, HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { IAcademiesRepositories } from "src/Modules/Academies/Repositories/IAcademies-repositories";
import { IAthelePaymentsRepositories } from "../Repositories/IAthlete-repositories";

@Injectable()
class GetAllAthletePaymentsService {
  constructor(
    @Inject(IAthelePaymentsRepositories)
    private readonly paymentsRepository: IAthelePaymentsRepositories,
    @Inject(IAcademiesRepositories)
    private readonly academyRepository:IAcademiesRepositories
  ) {}

  async execute(
    filters: { page: number; limit: number,academyId:string},
    credentials?: { sub: string; academyId: string | null; role: Role },
  ) {
    try {

            const existsAcademy = await this.academyRepository.findAcademyById({action:"OnlyBasicsDatas"}, filters.academyId)
            if(!existsAcademy)
            {
              throw new NotFoundException("Academia não encontrada.")
            }
            // ✅ V-05 FIX: comparar contra `academyId` (não `sub`, que agora
            // é sempre o Account.id)
            if(existsAcademy.id !== credentials?.academyId)
            {
              throw new UnauthorizedException("Você não tem permissão para acessar a lista de pagamentos de outras academias.")
            }
            const result = await this.paymentsRepository.getAllAthelePayments({
                page:  filters.page,
                limit: filters.limit,
                academyId: credentials?.academyId!
            });
            if(!result)
            {
              throw new NotFoundException("De momento ainda não existem pagamentos de atletas.")
            }
            return {success: true,statusCode: 200,...result};
        } catch (error: any)
        {
            if (error instanceof HttpException) throw error;
            console.error(error);
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.");
        }
    }
}

export { GetAllAthletePaymentsService };