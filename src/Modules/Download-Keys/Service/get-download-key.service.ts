// get-download-key.service.ts
import { Injectable, BadRequestException, ConflictException, HttpException, InternalServerErrorException, Inject, NotFoundException } from "@nestjs/common";
import { IDownloadKeysRepositories } from "../Repositories/IDownload-keys-repositories";
import { hashKey } from "src/Common/Utils/generate-codes";

@Injectable()
export class GetDownloadKeyService {
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
        let key
        if(params.key)
        {
            key = hashKey(params.key)
        }
        const result = await this.repository.getDownloadKey({
            key: key
        });
        if (!result){throw new NotFoundException("Chave de download não encontrada.");}
        const dataFormatted = {
            id: result.id,
            academyId: result.academyId,
            key: params.key,
            status: result.status,
            expiresAt: result.expiresAt,
            usedAt: result.usedAt,
            usedByIp: result.usedByIp,
            createdAt: result.createdAt,
            academy: {
                id: result.academy.id,
                name: result.academy.name,
                logoUrl: result.academy.logoUrl,
                affiliateNumber: result.academy.affiliateNumber
            }
        };
        return {success: true, statusCode: 200, datas: dataFormatted};    
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