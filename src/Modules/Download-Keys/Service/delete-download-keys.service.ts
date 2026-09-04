// get-download-key.service.ts
import { Injectable, BadRequestException, ConflictException, HttpException, InternalServerErrorException, Inject, NotFoundException } from "@nestjs/common";
import { IDownloadKeysRepositories } from "../Repositories/IDownload-keys-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { hashKey } from "src/Common/Utils/generate-codes";

@Injectable()
export class DeleteDownloadKeyService {
  constructor(private readonly repository: IDownloadKeysRepositories) {}

  async execute(params: Partial<{ id: string; usedByIp: string; key: string }>, credentials?:{sub: string, academyId: string | null, role: Role}): Promise<any>
  {
    try
    {   
        const hasParam = params.id || params.usedByIp || params.key;
        if (!hasParam)
        {
            throw new BadRequestException("Forneça pelo menos um parâmetro de busca: id, usedByIp ou key.");
        }
        if(params.key)
        {
            params.key = hashKey(params.key)
        }
        const existsKey = await this.repository.getDownloadKey(params)
        if(!existsKey)
        {
            throw new NotFoundException("Esta chave de download não existe.")
        }
        if(existsKey.status == "USED")
        {
            throw new BadRequestException("Apenas chaves activas podem ser eliminadas.")
        }
        const result = await this.repository.deleteDownloadKey(params);
        if (!result){throw new NotFoundException("Ocorreu um erro ao deletar esta chave de download.");}
        return {success: true, statusCode: 200, message:"Chave de download deletada com sucesso."};    
    } catch (error: any)
    {
        if(error instanceof HttpException)
            {
                throw error
            }
            console.error(error)
            throw new InternalServerErrorException("Ocorreu um erro, tente novamente")
    }
  }
}