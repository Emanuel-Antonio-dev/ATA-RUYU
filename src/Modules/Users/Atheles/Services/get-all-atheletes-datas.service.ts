// Services/get-all-athletes.service.ts

import {
  Injectable, Inject, HttpException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { IAtheleRepositories } from "../Repositories/IAthlete-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";

@Injectable()
class GetAllAthletesService {
  constructor(
    @Inject(IAtheleRepositories)
    private readonly repository: IAtheleRepositories,
  ) {}

  async execute(
    filters: { page: number; limit: number,academyId?:string;affiliateCode?: string;},
    credentials?: { sub: string; role: Role; academyId: string },
  ) {
    try {
      const result = await this.repository.getAllAtheles({
        page:  filters.page,
        limit: filters.limit,
      });
      if(!result)
      {
        throw new NotFoundException("De momento ainda não existem atletas")
      }
      return {
        success:    true,
        statusCode: 200,
        ...result,
      };

    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.");
    }
  }
}

export { GetAllAthletesService };