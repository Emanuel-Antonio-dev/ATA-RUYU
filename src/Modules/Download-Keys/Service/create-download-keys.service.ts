import {
  Injectable,
  HttpException,
  InternalServerErrorException,
  Inject,
  NotFoundException,
  ConflictException
} from "@nestjs/common";

import { generateDownloadKey, hashKey } from "src/Common/Utils/generate-codes";
import { IDownloadKeysRepositories } from "../Repositories/IDownload-keys-repositories";
import { IAcademiesRepositories } from "src/Modules/Academies/Repositories/IAcademies-repositories";
import { CreateDownloadKeyDto } from "../Dtos/validate-key.dto";

@Injectable()
export class CreateDownloadKeyService {
  constructor(
    @Inject(IDownloadKeysRepositories)
    private readonly repository: IDownloadKeysRepositories,

    @Inject(IAcademiesRepositories)
    private readonly academyRepository: IAcademiesRepositories
  ) {}

  async execute(datas: CreateDownloadKeyDto)
  {
    try {
      const academy = await this.academyRepository.findAcademyById(
        { action: "OnlyBasicsDatas" },
        datas.academyId,
        undefined
      );

      if (!academy) {
        throw new NotFoundException("Academia não encontrada.");
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      let key: string;
      let existing: any;
      let attempts = 0;
      let hashedKey: string

      do {
        key = generateDownloadKey();
        hashedKey = hashKey(key)
        existing = await this.repository.getDownloadKey({key: hashedKey});
        attempts++;
      } while (existing && attempts < 5);

      if (existing) {
        throw new ConflictException(
          "Já existe uma chave única gerada para esta academia."
        );
      }

      const result = await this.repository.registerDownloadKey({
        key: hashedKey,
        usedByIp: "",
        expiresAt,
        academyId: datas.academyId,
      });

      if (!result) {
        throw new InternalServerErrorException(
          "Erro ao salvar a chave de download."
        );
      }

      return {
        success: true,
        statusCode: 201,
        message: "Chave de download gerada com sucesso.",
        data: key,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        "Ocorreu um erro ao gerar a chave."
      );
    }
  }
}