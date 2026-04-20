// Services/find-athelete.service.ts

import { Injectable, Inject, NotFoundException, HttpException,InternalServerErrorException, ForbiddenException} from "@nestjs/common";
import { IAtheleRepositories } from "../Repositories/IAthlete-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";

@Injectable()
class GetAtheleteByAffiliateCodeService {
  constructor(
    @Inject(IAtheleRepositories)
    private readonly repository: IAtheleRepositories,
  ) {}

  async get(code: string, credentials?: { sub: string; role: Role},)
  {
    try {
      if(!code) throw new NotFoundException("Informe o(a) atleta.");
      const athelete = await this.repository.getAthleteDatasByAffiliateCode(code);
      if (!athelete) throw new NotFoundException("Atleta não encontrado(a).");
      return { success: true, statusCode: 200, datas: athelete };
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

export { GetAtheleteByAffiliateCodeService };