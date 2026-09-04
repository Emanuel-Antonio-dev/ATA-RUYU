import { ISubscriptionRepository } from "../Repositories/ISubscriptions-repositories";
import { ConflictException, Inject, Injectable, HttpException, InternalServerErrorException, UnauthorizedException, NotFoundException, BadRequestException, ForbiddenException} from "@nestjs/common";
import { SubscriptionStatus } from "generated/prisma/enums";
import { Role } from "src/Modules/Auth/Guards/roles.enum";

@Injectable()
export class CancelSubscriptionService {
  constructor(
    @Inject(ISubscriptionRepository)
    private readonly subscriptionRepo: ISubscriptionRepository,
  ) {}

  async execute(subscriptionId: string, credentials?: { sub: string; academyId: string | null; role: Role })
  {
    try {
      const subscription = await this.subscriptionRepo.findById(subscriptionId);

      if (!subscription) {
        throw new NotFoundException('Subscrição não encontrada.');
      }

      // ✅ V-03 FIX: sem esta verificação, qualquer afiliada conseguia
      // cancelar a subscrição de OUTRA academia (bastava conhecer o
      // subscriptionId) — via o cron de suspensão, isso levava à
      // suspensão de uma academia rival. CENTRAL/ADMIN_DEV mantêm acesso
      // total (podem cancelar qualquer subscrição).
      const isOwner = subscription.academyId === credentials?.academyId;
      const isStaff = credentials?.role === Role.CENTRAL || credentials?.role === Role.ADMIN_DEV;
      if (!isOwner && !isStaff) {
        throw new ForbiddenException('Não tens permissão para cancelar a subscrição de outra academia.');
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
      console.error(error);
      throw new InternalServerErrorException('Ocorreu um erro interno, tente novamente.');
    }
  }
}