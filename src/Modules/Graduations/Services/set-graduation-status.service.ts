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
        
        if (!athleteId)
        {
            throw new BadRequestException('Informe o(a) atleta.');
        }
      const existsAthlete = await this.athleteRepository.getAthleteDatas(athleteId);

      if (!existsAthlete)
        {
          throw new NotFoundException('Atleta não econtrado(a)');
        }
        const statusType = status === "APPROVED" ? "aprovar" : "negar"
        const messageTypeStatus = status === "APPROVED" ? "aprovada" : "negado"

        if(existsAthlete.academy.id !== credentials?.sub)
        {
            throw new ForbiddenException(`Você não pode ${statusType} a graduação de um(a) atleta de outra academia.`)
        }
        if(existsAthlete.graduations.length === 0)
        {
            throw new NotFoundException("Este atleta ainda não possui uma graduação pendente")
        }
        if(existsAthlete.graduations[0].status === "APPROVED" || existsAthlete.graduations[0].status === "NOT_APPROVED")
        {
          throw new BadRequestException(`A graduação deste(a) atleta já foi ${messageTypeStatus}`)
        }
        const result = await this.repository.setGraduationStatus(existsAthlete.graduations[0].id,athleteId, status);
        if (!result)
        {
          throw new InternalServerErrorException(`Ocorreu um erro ao ${statusType} a graduação, tente novamente`);
        }
      return { success: true, statusCode: 201, message:`Graduação ${messageTypeStatus} com sucesso` };
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