import { ISubscriptionRepository } from "../Repositories/ISubscriptions-repositories";
import { ConflictException, Inject, Injectable, HttpException, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException} from "@nestjs/common";
import { ISubscriptionPaymentRepository } from "../Repositories/ISubscriptions-payments.repositories";

@Injectable()
export class GetSubscriptionPaymentHistoryService {
  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,

    @Inject(ISubscriptionPaymentRepository)
    private readonly paymentRepo: ISubscriptionPaymentRepository,
  ) {}

  async execute(subscriptionId: string){
    try {
      const sub = await this.subscriptionRepo.findById(subscriptionId);

      if (!sub) {
        throw new NotFoundException('Subscrição não encontrada.');
      }

      const payments = await this.paymentRepo.findBySubscriptionId(subscriptionId);
      if(payments.length === 0)
      {
        throw new NotFoundException("Ocorreu um erro ao listar o histórico.")
      }

      return {
        success: true,
        statusCode: 200,
        message: 'Histórico obtido com sucesso',
        data: payments,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Ocorreu um erro interno, tente novamente.');
    }
  }
}