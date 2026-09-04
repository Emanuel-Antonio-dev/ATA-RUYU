import { ISubscriptionRepository } from "../Repositories/ISubscriptions-repositories";
import { ConflictException, Inject, Injectable, HttpException, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException} from "@nestjs/common";
import { SubscriptionStatus } from "generated/prisma/enums";
import { Not } from '../../../../generated/prisma/internal/prismaNamespace';

@Injectable()
export class RenewSubscriptionService {
  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,
  ) {}

  async execute(subscriptionId: string)
  {
    try {
      const subscription = await this.subscriptionRepo.findById(subscriptionId);
      if(!subscription)
        {
          throw new NotFoundException("Subscrição não encontrada.")
        }

      if (subscription.status === SubscriptionStatus.CANCELLED) {
        throw new BadRequestException('Não pode renovar uma subscrição cancelada.');
      }

      const now = new Date();

      const newStart =
        now > subscription.currentPeriodEnd ? now : subscription.currentPeriodEnd;

      const newEnd = new Date(newStart);
      newEnd.setMonth(newEnd.getMonth() + 1);

      const result = await this.subscriptionRepo.renewPeriod(
        subscriptionId,
        newStart,
        newEnd,
      );
      if(!result)
        {
          throw new InternalServerErrorException("Ocorreu um erro, tente novamente")
        }
      return {
        success: true,
        statusCode: 200,
        message: 'Subscrição renovada com sucesso',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Ocorreu um erro interno, tente novamente.');
    }
  }
}