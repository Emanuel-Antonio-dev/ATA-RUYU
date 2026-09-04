import { ISubscriptionRepository } from "../Repositories/ISubscriptions-repositories";
import { ConflictException, Inject, Injectable, HttpException, InternalServerErrorException, UnauthorizedException, NotFoundException} from "@nestjs/common";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { IAcademiesRepositories } from "src/Modules/Academies/Repositories/IAcademies-repositories";
import "dotenv/config"

@Injectable()
export class RegisterSubscriptionService {
  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly academiRepository: IAcademiesRepositories
  ) {}

  async execute(academyId: string, credentials?: {sub: string, academyId: string | null, role: Role})
  {
    try {
      const existsAcademy = await this.academiRepository.findAcademyById({action:"OnlyBasicsDatas"}, academyId)
      if(!existsAcademy)
      {
        throw new NotFoundException("Academia não encontrada.")
      }
      const existing = await this.subscriptionRepo.findByAcademyId(academyId);

      if (existing) {
        throw new ConflictException('Esta academia já possui uma subscrição activa.');
      }

      // ✅ V-05 FIX: comparar contra `academyId` (não `sub`) + bypass para
      // CENTRAL, que precisa de poder criar a subscrição de uma afiliada
      // recém-aprovada.
      if(credentials?.academyId !== academyId && credentials?.role !== Role.CENTRAL)
      {
        throw new UnauthorizedException("Você não tem permissão para ativar a subscrição de outra academia.")
      }
      const result = await this.subscriptionRepo.register({
        academyId,
        currency: process.env.SUBSCRIPTION_CURRENCY,
      });
      if(!result)
        {
        throw new InternalServerErrorException("Ocorreu um erro, tente novamente")
        }
      return {
        success: true,
        statusCode: 201,
        message: 'Subscrição criada com sucesso',
        data: {
          id: result.id,
          academyId: result.academyId,
          status: result.status,
          amount: result.amount,
          currency: result.currency,
          currentPeriodStart: result.currentPeriodStart.toLocaleString(),
          currentPeriodEnd: result.currentPeriodEnd.toLocaleString(),
          createdAt: result.createdAt,
        },
      };
    } catch (error)
    {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Ocorreu um erro interno, tente novamente.');
    }
  }
}