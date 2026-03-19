import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/lib/prisma.service";
import { IDownloadKeysRepositories } from "../IDownload-keys-repositories";
import { ValidateKeyDto } from "../../Dtos/validate-key.dto";
import { DownloadKeyStatus } from "generated/prisma/enums";

@Injectable()
class PrismaDownloadKeysRepositories implements IDownloadKeysRepositories
{
    constructor(private readonly prisma: PrismaService){}

    async registerDownloadKey(datas: ValidateKeyDto): Promise<any>
    {
        return await this.prisma.downloadKey.create({
            data:{
                key: datas.key,
                status: "ACTIVE",
                expiresAt: datas.expiresAt,
                usedAt: new Date(),
                usedByIp: datas.usedByIp,
                academyId: datas.academyId
            }
        })
    }
    async getDownloadKey(params: Partial<{ id: string; usedByIp: string; key: string; }>): Promise<any> {
        if(params.id)
        {
            return await this.prisma.downloadKey.findFirst({where:{id: params.id},include:{
                academy:{
                    select:{
                        id: true,
                        name: true,
                        logoUrl: true,
                        affiliateNumber: true,
                    }
                }
            }})
        }
        else if(params.usedByIp)
        {
            return await this.prisma.downloadKey.findFirst({where:{usedByIp: params.usedByIp},include:{
                academy:{
                    select:{
                        id: true,
                        name: true,
                        logoUrl: true,
                        affiliateNumber: true,
                    }
                }
            }})
        }
    return await this.prisma.downloadKey.findFirst({where:{id: params.id},include:{
        academy:{
            select:{
                id: true,
                name: true,
                logoUrl: true,
                affiliateNumber: true,
                }
            }
        }})
    }

    async deleteDownloadKey(params: Partial<{ id: string; usedByIp: string; key: string; }>): Promise<any>
    {
        if(params.id)
        {
            return await this.prisma.downloadKey.delete({where:{id: params.id}})
        }
        else if(params.usedByIp)
        {
            return await this.prisma.downloadKey.deleteMany({where:{usedByIp: params.usedByIp}})
        }
        return await this.prisma.downloadKey.delete({where:{key: params.key}})
    }
    async updateDownloadKey(id: string, data: Partial<{ status: DownloadKeyStatus; usedByIp: string; usedAt: Date }>): Promise<any> {
        return await this.prisma.downloadKey.update({
            where: { id },
            data:{...data},
        });
}
}
export {PrismaDownloadKeysRepositories}