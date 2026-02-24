// Services/update-academy.service.ts

import {
  Injectable, Inject, HttpException,
  InternalServerErrorException, NotFoundException, BadRequestException,
  ForbiddenException
} from "@nestjs/common";
import { UpdateAcademyRequestDto } from "src/Modules/Academies/Dtos/update-academy.dto";
import { IAtheleRepositories } from "../Repositories/IAthlete-repositories";
import { PrismaService } from "src/lib/prisma.service";
import sanitize from "sanitize-html";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { UpdateAthleteDto, UpdateAthleteRequestDto } from "../Dtos/update-thlete.dto";
import { BeltColor } from "generated/prisma/enums";

@Injectable()
class EditAtheleteService {
  constructor(
    @Inject(IAtheleRepositories)
    private readonly repository: IAtheleRepositories,
    private readonly prisma: PrismaService,
  ) {}
  async edit(
  id: string,
  datas: UpdateAthleteRequestDto,
  file?: Express.Multer.File,
  credentials?: { sub: string; role: Role},
) {
  try {
    if (!id) throw new BadRequestException("ID do atleta não informado.");

    const athlete = await this.repository.getAthleteDatas(id);
    if (!athlete) throw new NotFoundException("Atleta não encontrado/a.");
    console.log(athlete)

    // Verifica se pertence à academia do utilizador logado
    if (credentials?.sub !== athlete.academy.id) {
      throw new ForbiddenException("Não tens permissão para editar este atleta.");
    }

    const sanitizeText = (text?: string) =>
      text
        ? sanitize(text, { allowedTags: [], allowedAttributes: {}, allowedClasses: {} })
        : undefined;
        
        const datasToUpdate: UpdateAthleteDto = {};
        if (datas.fullName)        datasToUpdate.fullName       = sanitizeText(datas.fullName);
        if (datas.email)           datasToUpdate.email          = sanitizeText(datas.email);
        if (datas.birthDate)       datasToUpdate.birthDate      = datas.birthDate;
        if (datas.phone)           datasToUpdate.phone          = sanitizeText(datas.phone);
        if (datas.emergencyPhone)  datasToUpdate.emergencyPhone = sanitizeText(datas.emergencyPhone);
        if (datas.isActive !== undefined) datasToUpdate.isActive = datas.isActive;
        if (datas.documentNumber)
        {
          const alreadyExistsDocumentNumber = await this.prisma.athlete.findFirst({where:{documentNumber: datas.documentNumber}})
          if(alreadyExistsDocumentNumber)
          {
            throw new BadRequestException("Já existe um atleta registrado com este número de documento.")
          }
          datasToUpdate.documentNumber = sanitizeText(datas.documentNumber);
        }
        if (datas.documentType)
        {
          if(!Object.values(DocumentType).includes(datas.documentType))
          {
            throw new BadRequestException("Tipo de documento inválido.");
          }
          datasToUpdate.documentType   = datas.documentType;
        }
        if (datas.currentDegree)
          {
            if(!Object.values(DocumentType).includes(datas.currentDegree))
              {
                throw new BadRequestException("Número de divisas inválido.");
              }
              datasToUpdate.currentDegree  = datas.currentDegree;
          }
        
        if (datas.currentBelt) {
          if (!Object.values(BeltColor).includes(datas.currentBelt)) {
            throw new BadRequestException("Faixa inválida.");
          }
          datasToUpdate.currentBelt = datas.currentBelt;
        }
        const photoUrl = file ? `/uploads/AthletePhotos/${file.filename}`: datas.photoUrl ?? undefined;
        if (photoUrl) datasToUpdate.photoUrl = photoUrl;
        if (Object.keys(datasToUpdate).length === 0) {
          throw new BadRequestException("Nenhum campo para actualizar foi informado.");
        }
        const updated = await this.repository.updateAthlete(id, datasToUpdate);
        if(!updated)
        {
          throw new InternalServerErrorException("Ocorreu um erro ao editar os dados deste atleta.")
        }
    return {
      success:    true,
      statusCode: 200,
      message:    "Atleta actualizado/a com sucesso."
    };

  } catch (error: any) {
    if (error instanceof HttpException) throw error;
    console.error(error);
    throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.");
  }
}
}

export { EditAtheleteService };