// Services/find-academy.service.ts

import { Injectable, Inject, NotFoundException, HttpException,InternalServerErrorException, ForbiddenException} from "@nestjs/common";
import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { AcademyStatus, PrismaClient } from "generated/prisma/client";
import { PrismaService } from "src/lib/prisma.service";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { CacheService } from "src/Modules/Cache/cache.service";
@Injectable()
class DeleteAcademyService {
  constructor(
    @Inject(IAcademiesRepositories)
    private readonly repository: IAcademiesRepositories,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async delete(id: string,credentials?: { sub: string; academyId: string | null; role: Role },)
  {
    try {
        if(!id) throw new NotFoundException("ID da academia não informado.");
        const academy = await this.repository.findAcademyById({ action: "AllDatas" }, id);
        if (!academy) throw new NotFoundException("Academia não encontrada.");
        // ✅ V-05 FIX: `credentials.sub` é agora sempre o Account.id, nunca
        // o Academy.id — a comparação teria de falhar sempre. Comparamos
        // contra `academyId`, e adicionamos o bypass explícito para
        // CENTRAL que a auditoria identificou como estando em falta (a
        // Central deve poder gerir/remover afiliadas, não só a si própria).
        const isOwner = credentials?.academyId === id;
        const isCentral = credentials?.role === Role.CENTRAL;
        if(!isOwner && !isCentral)
        {
            throw new ForbiddenException("Não tens permissão para remover esta academia.");
        }
        // a conta da própria Central nunca pode ser apagada por esta via
        // (verifica o tipo da academia ALVO, não o papel de quem pede —
        // antes bloqueava sempre que quem pedia era CENTRAL, impedindo-a
        // de remover qualquer afiliada)
        if(academy.type === "CENTRAL")
        {
            throw new ForbiddenException("Você não pode eliminar a conta da Central.");
        }
        const transaction = await this.prisma.$transaction((async(tx)=>{
            await tx.account.deleteMany({where: {id: academy.account.id}});
            const deletedAcademy = await this.repository.deleteAcademy(id, tx);
            if(!deletedAcademy) throw new InternalServerErrorException("Ocorreu um erro ao deletar a academia.");
            return { success: true, statusCode: 200, message: "Academia deletada com sucesso." }
        }));
        this.cacheService.invalidatePattern("academies:list:");
        this.cacheService.invalidatePattern("academy:");
        this.cacheService.invalidatePattern("dashboard:academy:");    
        return { success: transaction.success, statusCode: transaction.statusCode, message: transaction.message };
    } catch (error: any) {
            if(error instanceof HttpException)
            {
                throw error
            }
            console.error(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
    }
  }

}

export { DeleteAcademyService };