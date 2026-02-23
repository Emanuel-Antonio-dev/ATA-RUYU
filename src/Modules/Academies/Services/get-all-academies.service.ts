// Services/find-all-academies.service.ts

import { Injectable, Inject, HttpException, InternalServerErrorException, BadRequestException, NotFoundException } from "@nestjs/common";
import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { AcademyStatus, AcademyType } from "generated/prisma/client";

@Injectable()
class GetAllAcademiesService {
  constructor(
    @Inject(IAcademiesRepositories)
    private readonly repository: IAcademiesRepositories,
  ) {}

  async execute(filters: {status?:AcademyStatus;type?:AcademyType;page:number;limit:number;})
  {
    try {
      const result = await this.repository.findAllAcademies(filters);
      if(result.data.length === 0) throw new NotFoundException("Nenhuma academia encontrada.");
      return {
        success:true,
        statusCode: 200,
        datas: result,
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.");
    }
  }
}

export { GetAllAcademiesService };