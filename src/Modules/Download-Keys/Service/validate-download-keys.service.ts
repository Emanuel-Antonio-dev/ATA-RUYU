import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  Inject
} from "@nestjs/common";

import { ValidateKeyDto } from "../Dtos/validate-key.dto";
import { IDownloadKeysRepositories } from "../Repositories/IDownload-keys-repositories";
import { hashKey } from "src/Common/Utils/generate-codes";

@Injectable()
export class ValidateDownloadKeyService {
  constructor(
    @Inject(IDownloadKeysRepositories)
    private readonly repository: IDownloadKeysRepositories
  ) {}

  async validate({key, usedByIp}:ValidateKeyDto ){
    try {
      const hashedKey = hashKey(key)
      const ip = usedByIp;

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

      // ⏰ expiração
      if (downloadKey.expiresAt && new Date() > downloadKey.expiresAt) {
        throw new ForbiddenException("Esta chave de download expirou.");
      }

      /**
       * ✅ B-06 FIX: era um read-then-write sem condição no WHERE — dois
       * pedidos concorrentes passavam ambos na verificação de status
       * acima antes de qualquer escrita, e ambos recebiam "Download
       * liberado!". A chave de activação (mecanismo de licenciamento da
       * app desktop, de uso único por desenho — ver documento de visão)
       * podia ser usada N vezes com um simples pedido paralelo. Agora o
       * status ACTIVE faz parte da condição da própria escrita: só UM
       * pedido consegue `count === 1`; qualquer outro concorrente recebe
       * `count === 0`, mesmo que ambos tenham passado na leitura acima.
       */
      const { count } = await this.repository.markKeyAsUsedAtomic(downloadKey.id, ip!);

      if (count === 0) {
        throw new ForbiddenException("Esta chave já foi utilizada.");
      }

      return {
        success: true,
        statusCode: 200,
        message: "Download liberado!",
        isDownloadAllowed: true
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error(error)
      throw new InternalServerErrorException(
        "Ocorreu um erro interno ao validar a chave."
      );
    }
  }
}