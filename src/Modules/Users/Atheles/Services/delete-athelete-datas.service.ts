// Services/find-academy.service.ts

import { Injectable, Inject, NotFoundException, HttpException,InternalServerErrorException, ForbiddenException} from "@nestjs/common";
import { IAtheleRepositories } from "../Repositories/IAthlete-repositories";
import { AcademyStatus, PrismaClient } from "generated/prisma/client";
import { PrismaService } from "src/lib/prisma.service";
import { Role } from "src/Modules/Auth/Guards/roles.enum";

@Injectable()
class DeleteAtheleteService {
  constructor(
    @Inject(IAtheleRepositories)
    private readonly repository: IAtheleRepositories,
  ) {}

  async delete(id: string,credentials?: { sub: string; role: Role },)
  {
    try {
        if(!id) throw new NotFoundException("ID da atleta não informado.");
        const athlete = await this.repository.getAthleteDatas(id);
        if (!athlete) throw new NotFoundException("atleta não encontrado/a.");
        if (credentials?.sub !== athlete.academy.id)
        {
            throw new ForbiddenException("Não tens permissão para eliminar este atleta.");
        }
        const athleteDeleted = await this.repository.deleteAthele(id)
        if(!athleteDeleted)
        {
            throw new InternalServerErrorException("Ocrreu em erro ao eliminar este não atleta.");  
        } 
        return { success: true, statusCode: 200, message: "Atleta deletado/a com sucesso." }
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

export { DeleteAtheleteService };