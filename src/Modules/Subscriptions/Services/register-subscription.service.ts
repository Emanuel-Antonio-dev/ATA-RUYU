import { ISubscriptionRepository } from "../Repositories/ISubscriptions-repositories";
import { ConflictException, Inject, Injectable, HttpException, InternalServerErrorException, UnauthorizedException} from "@nestjs/common";
import {SUBSCRIPTION_AMOUNT_AOA, SUBSCRIPTION_CURRENCY} from "../contants"
import { Role } from "src/Modules/Auth/Guards/roles.enum";

@Injectable()
export class RegisterSubscriptionService {
  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,
  ) {}

  async execute(academyId: string, credentials?: {sub: string, role: Role})
  {
    try {
      const existing = await this.subscriptionRepo.findByAcademyId(academyId);

      if (existing) {
        throw new ConflictException('Esta academia já possui uma subscrição activa.');
      }
      if(credentials?.sub !== academyId)
      {
        throw new UnauthorizedException("Você não tem permissão para realizar esta operação.")
      }
      const result = await this.subscriptionRepo.register({
        academyId,
        currency: SUBSCRIPTION_CURRENCY,
      });
      if(!result)
        {
        throw new InternalServerErrorException("Ocorreu um erro, tente novamente")
        }
      return {
        success: true,
        statusCode: 201,
        message: 'Subscrição criada com sucesso',
        data: result,
      };
    } catch (error)
    {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Erro ao criar subscrição');
    }
  }
}