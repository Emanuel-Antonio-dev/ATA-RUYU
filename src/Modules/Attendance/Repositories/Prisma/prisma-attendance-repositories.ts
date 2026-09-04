import { IAttendanceRepositories } from "../IAttendance-repositories";
import { PrismaService } from "src/lib/prisma.service";
import { Injectable } from "@nestjs/common";
import { MarkAttendanceDto } from "../../Dtos/mark-attendance.dto";

@Injectable()
class PrismaAttendanceRepositories implements IAttendanceRepositories
{
    constructor(private readonly prisma: PrismaService){}

    async markAttendance(datas: MarkAttendanceDto): Promise<any> {
        return await this.prisma.attendance.create({data:{...datas}})
    }
    async resumeOfAttendances(date: Date | string, academyId: string): Promise<any> {
        // ✅ V-01-style FIX: antes buscava as assiduidades de TODAS as
        // academias e filtrava em memória no service — qualquer conta
        // conseguia ler dados de outras academias antes do filtro (e o
        // filtro em si estava quebrado, comparando contra `sub`). Agora o
        // isolamento acontece na query.
        return await this.prisma.attendance.findMany({where:{classDate: date, academyId}, include:{
            athlete:{
                select:{
                    id: true,
                    fullName: true,
                    affiliateCode: true,
                    academyId: true,
                    documentNumber: true,
                    documentType: true
                }
            }
        }})
    }
}
export{PrismaAttendanceRepositories}