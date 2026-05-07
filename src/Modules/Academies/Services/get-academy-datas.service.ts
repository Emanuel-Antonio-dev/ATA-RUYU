// Services/find-academy.service.ts

import { Injectable, Inject, NotFoundException, HttpException,InternalServerErrorException, ForbiddenException} from "@nestjs/common";
import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { CacheService } from "src/Modules/Cache/cache.service";
import { CACHE_KEYS,CACHE_TTL} from "src/Modules/Cache/cache.constants";

@Injectable()
class GetAcademyService {
  constructor(
    @Inject(IAcademiesRepositories)
    private readonly repository: IAcademiesRepositories,
    private readonly cacheService: CacheService,
  ) {}

  async get(id: string, credentials?: { sub: string; role: Role},)
  {
    try {
      if(!id) throw new NotFoundException("Informe a academia.");
      if (credentials?.sub !== id)
        {
          throw new ForbiddenException("Não tens permissão para ver os dados desta academia.");
        }
        const cacheKey = CACHE_KEYS.academyUser(id, credentials?.sub);

        const academy = await this.cacheService.getOrSet(
          cacheKey,
          async () => {
            const data = await this.repository.findAcademyById({ action: "AllDatas" }, id);
            if (!data) {
              throw new NotFoundException("Academia não encontrada.");
            }
            return data;
          },
        CACHE_TTL.ACADEMY_PROFILE ?? 600, // fallback 10 min
        );
        return { success: true, statusCode: 200, datas: academy.data, cached: academy.cached };
    } catch (error: any) {
            if(error instanceof HttpException)
            {
                throw error
            }
            console.log(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
    }
  }

}

export { GetAcademyService };