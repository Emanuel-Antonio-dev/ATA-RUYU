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
    async resumeOfAttendances(date: Date | string): Promise<any> {
        return await this.prisma.attendance.findMany({where:{classDate: date}, include:{
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