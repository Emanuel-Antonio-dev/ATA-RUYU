import { IGraduationsRepositories } from "../IGraduations-repositories";
import { RegisterGraduationDto, RegisterGraduationReviewDto} from '../../Dtos/create-graduation.dto';
import { PrismaService } from "src/lib/prisma.service";
import { Injectable } from "@nestjs/common";
import { GraduationStatus } from "generated/prisma/enums";

@Injectable()
class PrismaGraduationRepositories implements IGraduationsRepositories
{
    constructor(private readonly prisma: PrismaService){}

    async registerGraduationReview(datas: RegisterGraduationReviewDto): Promise<any>
    {
        return await this.prisma.graduationReview.create({data:{
            comment: datas.comment,
            recommendation: datas.recommendation,
            athleteId: datas.athleteId,
            behaviorScore: datas.behaviorScore,
            technicalScore: datas.technicalScore
        }})
    }
    async registerAtheleGratuation(datas: RegisterGraduationDto): Promise<any>
    {
        return await this.prisma.graduation.create({data:{
            academyId: datas.academyId!,
            attendedClasses: datas.attendedClasses!,
            fromBelt: datas.fromBelt,
            fromDegree: datas.fromDegree,
            toBelt: datas.toBelt,
            toDegree: datas.toDegree,
            totalClasses: datas.totalClasses!,
            athleteId: datas.athleteId,
            graduatedAt: new Date()
        }})    
    }
    async getAtheleGraduationDatas(atheleId: string): Promise<any>
    {
        return await this.prisma.graduation.findFirst({where:{athleteId: atheleId}, select:{
            athlete:{select:{
                id: true,
                fullName: true,
                affiliateCode: true,
                birthDate: true,
                documentNumber: true,
                email: true,
                academy:{select:{name: true}}
            }}
        }})    
    }
    async getPendingGraduation(athleteId: string): Promise<any>
    {
        return this.prisma.graduation.findFirst({where: {athleteId, status: "NOT_APPROVED"}})
    }
    async getAllGraduations(academyId: string): Promise<any[]> {
        return await this.prisma.graduation.findMany({where:{academyId: academyId},omit:{academyId: true, athleteId: true},
            include:{
                athlete:{
                    select:{
                        id: true,
                        fullName: true,
                        affiliateCode: true,
                        birthDate: true,
                        documentNumber: true,
                        phone: true,
                        photoUrl: true,
                        graduationReviews:{
                            select:{
                                id: true,
                                comment: true,
                                recommendation: true,
                                createdAt: true
                            }
                        }
                    }
                }
            }})
    }
    async setGraduationStatus(id: string,athleteId: string, status: GraduationStatus): Promise<any> {
        return await this.prisma.graduation.update({where:{id: id,athleteId: athleteId}, data:{status: status}})
    }
}
export {PrismaGraduationRepositories}
