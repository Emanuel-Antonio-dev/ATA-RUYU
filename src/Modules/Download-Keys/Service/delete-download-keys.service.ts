// get-download-key.service.ts
import { Injectable, BadRequestException, ConflictException, HttpException, InternalServerErrorException, Inject, NotFoundException } from "@nestjs/common";
import { IDownloadKeysRepositories } from "../Repositories/IDownload-keys-repositories";

@Injectable()
export class DeleteDownloadKeyService {
  constructor(private readonly repository: IDownloadKeysRepositories) {}

  async execute(params: Partial<{ id: string; usedByIp: string; key: string }>): Promise<any>
  {
    try
    {   
        const hasParam = params.id || params.usedByIp || params.key;
        if (!hasParam)
        {
            throw new BadRequestException("Forneça pelo menos um parâmetro de busca: id, usedByIp ou key.");
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
            throw new InternalServerErrorException("Ocorreu um erro, tente novamente")
    }
  }
}