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

@Injectable()
class GetAllGraduationsService {
  constructor(
    @Inject(IGraduationsRepositories)
    private readonly repository: IGraduationsRepositories,
  ) {}

  async getAll(academyId: string, credentials?: {sub: string, role: Role}) {
    try {
        
        if (!academyId)
        {
            throw new BadRequestException('Informe a academia.');
        }
        if(academyId !== credentials?.sub)
        {
            throw new ForbiddenException("Você não pode ver a lista de graduação de outra academia.")
        }
      const result = await this.repository.getAllGraduations(academyId);

      if (!result || result.length === 0) {
        throw new NotFoundException('Nenhuma graduação encontrada para esta academia.');
      }

      return { success: true, statusCode: 200, datas: result };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Ocorreu um erro interno, tente novamente.');
    }
  }
}

export { GetAllGraduationsService };