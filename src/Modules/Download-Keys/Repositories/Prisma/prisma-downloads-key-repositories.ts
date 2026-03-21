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
                expiresAt: datas.expiresAt!,
                usedAt: new Date(),
                usedByIp: datas.usedByIp,
                academyId: datas.academyId
            }
        })
    }
    async getDownloadKey(params: Partial<{ id: string; usedByIp: string; key: string; academyId: string }>): Promise<any> {
    const whereClause: any = {};

    if (params.id) whereClause.id = params.id;
    if (params.usedByIp) whereClause.usedByIp = params.usedByIp;
    if (params.key) whereClause.key = params.key;
    if (params.academyId) whereClause.academyId = params.academyId;

    return await this.prisma.downloadKey.findFirst({
        where: whereClause,
        include: {
            academy: {
                select: {
                    id: true,
                    name: true,
                    logoUrl: true,
                    affiliateNumber: true,
                }
            }
        }
    });
}

    async deleteDownloadKey(params: Partial<{ id: string; usedByIp: string; key: string; }>): Promise<any>
    {
        const whereClause: any = {};
        if (params.id) whereClause.id = params.id;
        if (params.usedByIp) whereClause.usedByIp = params.usedByIp;
        if (params.key) whereClause.key = params.key;
        return await this.prisma.downloadKey.delete({where: whereClause});
    }
    async updateDownloadKey(id: string, data: Partial<{ status: DownloadKeyStatus; usedByIp: string; usedAt: Date }>): Promise<any> {
        return await this.prisma.downloadKey.update({
            where: { id },
            data:{usedAt: data.usedAt, status: data.status, usedByIp: data.usedByIp},
        });
}
}
export {PrismaDownloadKeysRepositories}