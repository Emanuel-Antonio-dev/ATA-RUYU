// Services/find-athelete.service.ts

import { Injectable, Inject, NotFoundException, HttpException,InternalServerErrorException, ForbiddenException} from "@nestjs/common";
import { IAtheleRepositories } from "../Repositories/IAthlete-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { PrismaService } from "src/lib/prisma.service";

@Injectable()
class GetAtheleteService {
  constructor(
    @Inject(IAtheleRepositories)
    private readonly repository: IAtheleRepositories,
  ) {}

  async get(code: string, credentials?: { sub: string; role: Role},)
  {
    try {
      if(!code) throw new NotFoundException("Código de afiliação do/a atleta não informado.");
        const athelete = await this.repository.getAthleteDatasByAffiliateCode(code);
        if (!athelete) throw new NotFoundException("Atleta não encontrado/a em nenhuma academia.");
        return { success: true, statusCode: 200, datas: athelete };
    } 
    catch (error: any)
    {
      if(error instanceof HttpException)
      {
        throw error
      }
      console.log(error)
      throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
    }
  }

}

export { GetAtheleteService };