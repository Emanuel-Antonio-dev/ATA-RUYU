import {
  Injectable,
  Inject,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { AcademyStatus, AcademyType } from "generated/prisma/client";
import { CacheService} from "src/Modules/Cache/cache.service";
import { CACHE_KEYS, CACHE_TTL} from "src/Modules/Cache/cache.constants";
import { hashFilters } from "src/Common/Utils/cache.util";


@Injectable()
class GetAllAcademiesService {
  constructor(
    @Inject(IAcademiesRepositories)
    private readonly repository: IAcademiesRepositories,
    private readonly cacheService: CacheService,
  ) {}

  async getAll(filters: {
    status?: AcademyStatus;
    type?: AcademyType;
    page: number;
    limit: number;
  }) {
    try {
      // 🔑 cria hash único para os filtros
      const filterHash = hashFilters(filters);

      const cacheKey = CACHE_KEYS.academiesList(filterHash);

      const result = await this.cacheService.getOrSet(
        cacheKey,
        async () => {
          const data = await this.repository.findAllAcademies(filters);

          if (data.data.length === 0) {
            throw new NotFoundException("Nenhuma academia encontrada.");
          }

          return data;
        },
        CACHE_TTL.ACADEMY_LIST, // 5–10 min normalmente
      );
      return {
        success: true,
        statusCode: 200,
        datas: result.data.data,
        pagination: {
          total: result.data.total,
          page: result.data.page,
          limit: result.data.limit,
          totalPages: result.data.totalPages,
        },
        cahched: result.cached,
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      console.error(error);
      throw new InternalServerErrorException(
        "Ocorreu um erro interno, tente novamente.",
      );
    }
  }
}

export { GetAllAcademiesService };