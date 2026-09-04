// Services/update-academy.service.ts

import {
  Injectable, Inject, HttpException,
  InternalServerErrorException, NotFoundException, BadRequestException,
  ForbiddenException,
  ConflictException
} from "@nestjs/common";
import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { UpdateAcademyRequestDto } from "../Dtos/update-academy.dto";
import { PrismaService } from "src/lib/prisma.service";
import sanitize from "sanitize-html";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import * as bcrypt from 'bcrypt';
import { CacheService } from "src/Modules/Cache/cache.service";
@Injectable()
class EditAcademyService {
  constructor(
    @Inject(IAcademiesRepositories)
    private readonly repository: IAcademiesRepositories,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async edit(id: string, datas: UpdateAcademyRequestDto, file?: Express.Multer.File,credentials?: { sub: string; academyId: string | null; role: Role },
) {
    try {
      if (!id) throw new BadRequestException("ID da academia não informado.");
      const academy = await this.repository.findAcademyById({ action: "OnlyBasicsDatas" }, id);
      if (!academy) throw new NotFoundException("Academia não encontrada.");
      // ✅ V-05 FIX: comparar contra `academyId` (não `sub`, que agora é
      // sempre o Account.id) + bypass explícito para CENTRAL, que deve
      // conseguir editar qualquer afiliada, não só a si própria.
      if (credentials?.academyId !== id && credentials?.role !== Role.CENTRAL)
        {
          throw new ForbiddenException("Não tens permissão para editar esta academia.");
        }

      const sanitizeText = (text?: string) =>
        text
          ? sanitize(text, { allowedTags: [], allowedAttributes: {}, allowedClasses: {} })
          : undefined;

        const datasToUpdate: UpdateAcademyRequestDto={}
        if(datas.name)
        {
          // ✅ B-10 FIX: exclui o próprio registo — sem isto, submeter o
          // formulário sem alterar o nome encontrava a própria academia e
          // rejeitava com 409 sempre.
          const alreadyExistsName = await this.prisma.academy.findFirst({where:{name: datas.name, id: {not: id}}})
          if(alreadyExistsName)
          {
            throw new ConflictException("Este nome já está sendo usado")
          }
          datasToUpdate.name = sanitizeText(datas.name)
        }
        if(datas.address)
        {
          datasToUpdate.address = sanitizeText(datas.address)
        }
        if(datas.city)
        {
          datasToUpdate.city = sanitizeText(datas.city)
        }
        if(datas.email)
        {
          const alreadyExistsEmail = await this.prisma.account.findFirst({where:{email: datas.email, id: {not: academy.account.id}}})
          if(alreadyExistsEmail)
          {
            throw new ConflictException("Este email já está sendo usado")
          }
          datasToUpdate.email = sanitizeText(datas.email)
        }
        if(datas.phone)
        {
          const alreadyExistsPhoneNumber = await this.prisma.account.findFirst({where:{phone: datas.phone, id: {not: academy.account.id}}})
          if(alreadyExistsPhoneNumber)
          {
            throw new ConflictException("Este contacto telefonico já está sendo usado")
          }
          datasToUpdate.phone = sanitizeText(datas.phone)
        }
        const logoUrl = file? `/uploads/AcademyLogos/${file.filename}`: datas.logoUrl ?? undefined;
        if(logoUrl)
        {
          datasToUpdate.logoUrl = sanitizeText(logoUrl)
        }
        if(datas.password)
        {
          if(!datas.newPassword)
          {
            throw new BadRequestException("Informe a sua nova senha.")
          }
          const searchPassword = await this.prisma.account.findFirst({where:{email: academy.account.email}})
          const passwordMatch = await bcrypt.compare(datas.password, searchPassword?.passwordHash!)
          if (!passwordMatch)
            {
              throw new BadRequestException("A sua senha atual está incorrecta")
            }
            const passwordHashed = await bcrypt.hash(datas.newPassword, 12) // ✅ 5.12 FIX: custo padronizado para 12 (era 10 aqui, inconsistente com o resto)
            datasToUpdate.newPassword = passwordHashed
        }
        
      const updated = await this.repository.updateAcademy(id, datasToUpdate)
      if(!updated)
      {
        throw new InternalServerErrorException("Ocorreu um erro ao atualizar os dados desta academia")
      }
      this.cacheService.invalidatePattern("academies:list:");
      this.cacheService.invalidatePattern("academy:");
      this.cacheService.invalidatePattern("dashboard:academy:");    
      return {
        success:    true,
        statusCode: 200,
        message:    "Academia actualizada com sucesso."
      };

    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.");
    }
  }
}

export { EditAcademyService };