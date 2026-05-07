import {
    BadRequestException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IGraduationsRepositories } from '../Repositories/IGraduations-repositories';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { IAtheleRepositories } from 'src/Modules/Users/Atheles/Repositories/IAthlete-repositories';

type GraduationStatus = 'APPROVED' | 'NOT_APPROVED';

const STATUS_LABELS: Record<GraduationStatus, { action: string; past: string }> = {
  APPROVED:     { action: 'aprovar',  past: 'aprovada'  },
  NOT_APPROVED: { action: 'reprovar', past: 'reprovada' },
};

@Injectable()
class SetGraduationStatusService {
  constructor(
    @Inject(IGraduationsRepositories)
    private readonly repository: IGraduationsRepositories,
    @Inject(IAtheleRepositories)
    private readonly athleteRepository: IAtheleRepositories
  ) {}

  async set(athleteId: string, status:"APPROVED" | "NOT_APPROVED",credentials?: {sub: string, role: Role}) {
    try {
          const { action, past } = STATUS_LABELS[status];
          if (!athleteId)
            {
              throw new BadRequestException('Informe o(a) atleta.');
            }
            const existsAthlete = await this.athleteRepository.getAthleteDatas(athleteId);
            if (!existsAthlete)
            {
              throw new NotFoundException('Atleta não econtrado(a)');
            }

            if(existsAthlete.academy.id !== credentials?.sub)
            {
              throw new ForbiddenException(`Você não tem permissão para ${action} a graduação de um(a) atleta de outra academia.`)
            }
            const pendingGraduation = existsAthlete.graduations.find(g => g.status === 'PENDING');
            console.log(existsAthlete.graduations)
            if (!pendingGraduation)
            {
              throw new NotFoundException('Este(a) atleta não possui nenhuma graduação pendente.');
            }
            if(existsAthlete.graduations[0].status === "APPROVED" || existsAthlete.graduations[0].status === "NOT_APPROVED")
            {
              throw new BadRequestException(`A graduação deste(a) atleta já foi ${past}`)
            }
            const result = await this.repository.setGraduationStatus(existsAthlete.graduations[0].id,athleteId, status);
            if (!result)
            {
              throw new InternalServerErrorException(`Ocorreu um erro ao ${action} a graduação, tente novamente`);
            }
            //Deve notificar no painel sobre a decisão da graduação do atleta em questão
            return { success: true, statusCode: 200, message:`Graduação ${past} com sucesso` };
          } catch (error: any) {
            if (error instanceof HttpException) {
              console.log(error)
              throw error;
            }
            console.log(error)
            throw new InternalServerErrorException('Ocorreu um erro interno, tente novamente.');
          }
        }
      }

export { SetGraduationStatusService };