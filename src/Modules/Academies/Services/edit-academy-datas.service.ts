// Services/update-academy.service.ts

import {
  Injectable, Inject, HttpException,
  InternalServerErrorException, NotFoundException, BadRequestException,
  ForbiddenException
} from "@nestjs/common";
import { IAcademiesRepositories } from "../Repositories/IAcademies-repositories";
import { UpdateAcademyRequestDto } from "../Dtos/update-academy.dto";
import { PrismaService } from "src/lib/prisma.service";
import sanitize from "sanitize-html";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
@Injectable()
class EditAcademyService {
  constructor(
    @Inject(IAcademiesRepositories)
    private readonly repository: IAcademiesRepositories,
    private readonly prisma: PrismaService,
  ) {}

  async edit(id: string, datas: Partial<UpdateAcademyRequestDto>, file?: Express.Multer.File,credentials?: { sub: string; role: Role },
) {
    try {
      if (!id) throw new BadRequestException("ID da academia não informado.");
      if (credentials?.sub !== id)
        {
            throw new ForbiddenException("Não tens permissão para editar esta academia.");
        }
      const academy = await this.repository.findAcademyById({ action: "OnlyBasicsDatas" }, id);
      if (!academy) throw new NotFoundException("Academia não encontrada.");

      const sanitizeText = (text?: string) =>
        text
          ? sanitize(text, { allowedTags: [], allowedAttributes: {}, allowedClasses: {} })
          : undefined;

      const logoUrl = file
        ? `/uploads/AcademyLogos/${file.filename}`
        : datas.logoUrl ?? undefined;

      const updated = await this.repository.updateAcademy(id, {
        ...(datas.name     && { name:     sanitizeText(datas.name) }),
        ...(datas.address  && { address:  sanitizeText(datas.address) }),
        ...(datas.province && { province: sanitizeText(datas.province) }),
        ...(datas.city     && { city:     sanitizeText(datas.city) }),
        ...(logoUrl        && { logoUrl }),
      });

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