// Services/find-academy.service.ts

import { Injectable, Inject, NotFoundException, HttpException,InternalServerErrorException, ForbiddenException} from "@nestjs/common";
import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { AcademyStatus, PrismaClient } from "generated/prisma/client";
import { PrismaService } from "src/lib/prisma.service";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
@Injectable()
class DeleteAcademyService {
  constructor(
    @Inject(IAcademiesRepositories)
    private readonly repository: IAcademiesRepositories,
    private readonly prisma: PrismaService
  ) {}

  async delete(id: string,credentials?: { sub: string; role: Role },)
  {
    try {
        if(!id) throw new NotFoundException("ID da academia não informado.");
        const academy = await this.repository.findAcademyById({ action: "AllDatas" }, id);
        if(credentials?.sub !== id)
        {
            throw new ForbiddenException("Não tens permissão para remover esta academia.");
        }
        if(credentials?.role === Role.CENTRAL)
        {
            throw new ForbiddenException("Você não pode eliminar a conta da Central.");
        }
        if (!academy) throw new NotFoundException("Academia não encontrada.");
        const transaction = await this.prisma.$transaction((async(tx)=>{
            await tx.account.deleteMany({where: {id: academy.account.id}});
            const deletedAcademy = await this.repository.deleteAcademy(id, tx);
            if(!deletedAcademy) throw new InternalServerErrorException("Ocorreu um erro ao deletar a academia.");
            return { success: true, statusCode: 200, message: "Academia deletada com sucesso." }
        }));
        return { success: transaction.success, statusCode: transaction.statusCode, message: transaction.message };
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

export { DeleteAcademyService };