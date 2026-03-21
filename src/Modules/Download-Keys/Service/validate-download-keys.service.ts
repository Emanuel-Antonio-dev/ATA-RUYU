import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  Inject
} from "@nestjs/common";

import { Request } from "express";
import { ValidateKeyDto } from "../Dtos/validate-key.dto";
import { IDownloadKeysRepositories } from "../Repositories/IDownload-keys-repositories";
import { hashKey } from "src/Common/Utils/generate-codes";

@Injectable()
export class ValidateDownloadKeyService {
  constructor(
    @Inject(IDownloadKeysRepositories)
    private readonly repository: IDownloadKeysRepositories
  ) {}

  async validate(datas: ValidateKeyDto){
    try {
      const { key, academyId } = datas;
      const hashedKey = hashKey(key)
      const usedByIp = datas.usedByIp;

      const downloadKey = await this.repository.getDownloadKey({ key: hashedKey });
      if (!downloadKey) {
        throw new NotFoundException(
          "Chave de download não encontrada. Contacte a central."
        );
      }
      if(downloadKey.status === "USED")
      {
        throw new ForbiddenException("Esta chave de download já foi utilizada."); 
      }

      // 🔐 valida academia
      if (downloadKey.academyId !== academyId) {
        throw new ForbiddenException(
          "Esta chave de download não pertence a esta academia."
        );
      }

      // ⏰ expiração
      if (downloadKey.expiresAt && new Date() > downloadKey.expiresAt) {
        throw new ForbiddenException("Esta chave de download expirou.");
      }

      /**
       * 🔥 UPDATE ATÓMICO (ESSENCIAL)
       * Isso deve garantir que apenas 1 request consegue usar a chave
       */
      const updated = await this.repository.updateDownloadKey(
        downloadKey.id,
        {
          usedByIp,
          usedAt: new Date(),
          status: "USED",
        }
      );

      if (!updated) {
        throw new ForbiddenException("Ocorreu um erro ao liberar o download, tente novamente.");
      }

      return {
        success: true,
        statusCode: 200,
        message: "Download liberado!",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.log(error)
      throw new InternalServerErrorException(
        "Ocorreu um erro interno ao validar a chave."
      );
    }
  }
}