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
                academyId: datas.academyId!
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
        omit: {academyId: true},
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

    // ✅ B-06 FIX: `updateMany` com o status ACTUAL na cláusula WHERE —
    // dois pedidos concorrentes com a mesma chave só conseguem, entre os
    // dois, que UM `count` volte 1; o outro recebe `count: 0` porque, no
    // momento em que a sua escrita corre, o status já não é mais ACTIVE.
    // Antes era um read-then-write sem condição — ambos os pedidos liam
    // "ACTIVE" antes de qualquer escrita, e ambos conseguiam liberar o
    // download com a mesma chave de uso único.
    async markKeyAsUsedAtomic(id: string, usedByIp: string): Promise<{ count: number }> {
        return await this.prisma.downloadKey.updateMany({
            where: { id, status: "ACTIVE" },
            data:  { status: "USED", usedAt: new Date(), usedByIp },
        });
    }
}
export {PrismaDownloadKeysRepositories}