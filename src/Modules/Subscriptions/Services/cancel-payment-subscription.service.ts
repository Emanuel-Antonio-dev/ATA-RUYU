import { ISubscriptionRepository } from "../Repositories/ISubscriptions-repositories";
import { ConflictException, Inject, Injectable, HttpException, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException} from "@nestjs/common";
import { SubscriptionStatus } from "generated/prisma/enums";

@Injectable()
export class CancelSubscriptionService {
  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,
  ) {}

  async execute(subscriptionId: string)
  {
    try {
      const subscription = await this.subscriptionRepo.findById(subscriptionId);

      if (!subscription) {
        throw new NotFoundException('Subscrição não encontrada.');
      }

      if (subscription.status === SubscriptionStatus.CANCELLED) {
        throw new BadRequestException('Já está cancelada.');
      }

      const result = await this.subscriptionRepo.updateStatus(
        subscriptionId,
        SubscriptionStatus.CANCELLED,
      );
      if(!result)
      {
        throw new InternalServerErrorException("Ocorreu um erro, tente novamente")
      }

      return {
        success: true,
        statusCode: 200,
        message: 'Subscrição cancelada com sucesso'
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Ocorreu um erro interno, tente novamente.');
    }
  }
}