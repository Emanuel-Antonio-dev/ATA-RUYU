// validate-download-key.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  Inject
} from "@nestjs/common";
import { ValidateKeyDto } from "../Dtos/validate-key.dto";
import { IDownloadKeysRepositories } from "../Repositories/IDownload-keys-repositories";

@Injectable()
export class ValidateDownloadKeyService {
  constructor(@Inject(IDownloadKeysRepositories) private readonly repository: IDownloadKeysRepositories) {}

  async validate(datas: ValidateKeyDto): Promise<any>
  {
    try
    {
        const { key, usedByIp } = datas;

        // 1. Chave existe?
        const downloadKey = await this.repository.getDownloadKey({ key });
        if (!downloadKey)
            {
                throw new NotFoundException("Chave de download não encontrada, entre em contacto com a central.");
            }

    // 2. Chave já foi usada?
        if (downloadKey.status === "USED")
        {
            throw new ForbiddenException("Esta chave já foi utilizada, entre em contacto com a centrar para geral uma nova.");
        }

        // 3. Chave está activa?
        if (downloadKey.status !== "ACTIVE")
        {
            throw new ForbiddenException(`Chave inválida. Status actual: ${downloadKey.status}`);
        }

        // 4. Chave expirou?
        if (downloadKey.expiresAt && new Date() > new Date(downloadKey.expiresAt)) {
        throw new ForbiddenException("Esta chave de download expirou.");
        }

        // 5. IP já usou outra chave?
        const ipAlreadyUsed = await this.repository.getDownloadKey({ usedByIp });
        if (ipAlreadyUsed && ipAlreadyUsed.id !== downloadKey.id)
        {
            throw new ForbiddenException("Este IP já utilizou uma chave de download.");
        }

        // 6. Marca chave como usada e regista o IP
        const result =  await this.repository.updateDownloadKey(downloadKey.id, {
            status: "USED",
            usedByIp,
            usedAt: new Date(),
        });
        if(!result)
        {
            throw new InternalServerErrorException("Ocorreu um erro ao verificar esta chave, tente novamente")
        }
        return {success: true, statusCode: 200, message:"Download liberado!"}
    } catch (error: any)
    {
        if(error instanceof HttpException)
        {
            throw error
        }
        throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
    }
  }
}