// create-download-key.service.ts
import { Injectable, BadRequestException, ConflictException, HttpException, InternalServerErrorException, Inject, NotFoundException } from "@nestjs/common";
import { generateDownloadKey } from "src/Common/Utils/generate-codes";
import { PrismaDownloadKeysRepositories } from "../Repositories/Prisma/prisma-downloads-key-repositories";
import { IDownloadKeysRepositories } from "../Repositories/IDownload-keys-repositories";
import { IAcademiesRepositories } from "src/Modules/Academies/Repositories/IAcademies-repositories";
import { CreateDownloadKeyDto } from "../Dtos/validate-key.dto";

@Injectable()
export class CreateDownloadKeyService {
  constructor(
    @Inject(IDownloadKeysRepositories) private readonly repository: IDownloadKeysRepositories,
    @Inject(IAcademiesRepositories) private readonly academyRepository: IAcademiesRepositories

) {}

  async execute(datas: CreateDownloadKeyDto): Promise<any>
  {
    try
    {
            const existsAcademy = await this.academyRepository.findAcademyById({action:"OnlyBasicsDatas"},datas.academyId, undefined)
            if(!existsAcademy)
            {
                throw new NotFoundException("Academia não encontrada.")
            }
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);
        // Gera chave única (tenta até 3 vezes para evitar colisão)
        let key: string;
        let attempts = 0;
        do {
            key = generateDownloadKey();
            const existing = await this.repository.getDownloadKey({ key });
            if (!existing) break;
            attempts++;
        } while (attempts < 3);

        if (attempts >= 3)
        {
            throw new ConflictException("Não foi possível gerar uma chave única. Tente novamente.");
        }

        const result = await this.repository.registerDownloadKey({
            key,
            usedByIp: "",
            expiresAt: expiresAt,
            academyId: datas.academyId,
    });
    if(!result)
    {
        throw new InternalServerErrorException("Ocorreu um erro ao gerar esta chave de download, tente novamente.")
    }
    return {success: true, statusCode: 201, message:"Chave de download gerada com sucesso", datas:result.key}
    } catch (error: any)
    {
        if(error instanceof HttpException)
        {
            throw error
        }
        throw new InternalServerErrorException("Ocorreu um erro, tente novamente.")
    }
  }
}