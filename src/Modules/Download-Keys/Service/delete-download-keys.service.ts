// get-download-key.service.ts
import { Injectable, BadRequestException, ConflictException, HttpException, InternalServerErrorException, Inject, NotFoundException } from "@nestjs/common";
import { IDownloadKeysRepositories } from "../Repositories/IDownload-keys-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";

@Injectable()
export class DeleteDownloadKeyService {
  constructor(private readonly repository: IDownloadKeysRepositories) {}

  async execute(params: Partial<{ id: string; usedByIp: string; key: string }>, credentials?:{sub: string, role: Role}): Promise<any>
  {
    try
    {   
        const hasParam = params.id || params.usedByIp || params.key;
        if (!hasParam)
        {
            throw new BadRequestException("Forneça pelo menos um parâmetro de busca: id, usedByIp ou key.");
        }
        const existsKey = await this.repository.getDownloadKey(params)
        if(!existsKey)
        {
            throw new NotFoundException("Esta chave de download não existe.")
        }
        const result = await this.repository.deleteDownloadKey(params);
        if (!result){throw new NotFoundException("Chave de download não encontrada.");}
        return {success: true, statusCode: 200, message:"Chave de download deletada com sucesso."};    
    } catch (error: any)
    {
        if(error instanceof HttpException)
            {
                throw error
            }
            console.log(error)
            throw new InternalServerErrorException("Ocorreu um erro, tente novamente")
    }
  }
}