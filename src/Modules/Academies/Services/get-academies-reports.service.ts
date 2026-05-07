import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { IAcademiesRepositories } from '../Repositories/IAcademies-repositories';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';
import { CacheService } from 'src/Modules/Cache/cache.service';

@Injectable()
class GetAcademiesReportsService {
  constructor(
    @Inject(IAcademiesRepositories)
    private readonly repository: IAcademiesRepositories,
    private readonly cacheService: CacheService,
  ) {}

  async get(credentials?: { sub: string; role: Role}) {
    try {
      
      if (credentials?.role === 'AFFILIATE') {
        const result = await this.repository.getAffiliateReport(credentials?.sub);

        if (!result) {
          throw new NotFoundException('De momento a sua academia está sem relatórios.');
        }

        return { success: true, statusCode: 200, data: result };
      }

      if (credentials?.role === 'CENTRAL') {
        // passa o academyId da central para incluir os seus próprios dados
        const result = await this.repository.getCentralReport();

        if (!result) {
          throw new NotFoundException('De momento a sua academia está sem relatórios.');
        }

        return { success: true, statusCode: 200, data: result };
      }

      throw new ForbiddenException('Não tens permissão para visualizar estes dados.');

    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('[GetAcademiesReportsService]', error);
      throw new InternalServerErrorException('Ocorreu um erro interno, tente novamente.');
    }
  }
}

export { GetAcademiesReportsService };