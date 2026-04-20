import { PrismaService } from "src/lib/prisma.service";
import { IAtheleRepositories } from "../IAthlete-repositories";
import { Injectable, Inject, NotFoundException, HttpException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { Prisma } from "generated/prisma/client";
import { CreateAthleteDto } from "../../Dtos/create-athlete.dto";
import { UpdateAthleteDto, UpdateAthleteRequestDto } from "../../Dtos/update-thlete.dto";
import { generateAffiliateNumber } from "src/Common/Utils/generate-codes";
import { CreatePaymentDto } from "../../../../Atheles-payments/Dtos/create-payment.dto";

@Injectable()
class PrismaAthelesRepositories implements IAtheleRepositories
{
    constructor(private readonly prisma: PrismaService){}
    async registerAthlete(datas: CreateAthleteDto, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any> {
        const client = tx ?? this.prisma
        return await client.athlete.create({data: {
            fullName: datas.fullName,
            birthDate: new Date(datas.birthDate),
            email: datas.email,
            phone: datas.phoneNumber,
            emergencyPhone: datas.emergencyPhone,
            currentBelt: datas.currentBelt,
            currentDegree: datas.currentDegree,
            photoUrl: datas.photoUrl,
            academyId: datas.academyId,
            documentNumber: datas.documentNumber!,
            documentType: datas.documentType!,
            enrolledAt: new Date(datas.enrolledAt),
            affiliateCode: datas.affiliateCode
        }})
    }

    async getAthleteDatas(id: string): Promise<any>
    {
        return await this.prisma.athlete.findUnique({where:{id: id}, include:{academy:{
            select:{
                id: true,
                name: true,
                logoUrl: true,
                address: true,
                province: true,
                city: true,
                affiliateNumber: true,
            }
        },
        payments:{
            select:{
                id: true, 
                amount: true,
                paidAt: true,
                status: true,
                referenceMonth: true,
            }
        },
        attendances:{
            select:{
                id: true,
                present: true,
                classDate: true
            }
        },
        graduations:{
            select:{
                id: true,
                attendedClasses: true,
                totalClasses: true,
                fromBelt: true,
                fromDegree: true,
                toBelt: true,
                toDegree: true,
                status: true,
                graduatedAt: true
            }
        },
        graduationReviews:{
            select:{
                id: true,
                comment: true,
                recommendation: true,
                createdAt: true
            }
        }
    }})
    }
        async getAthleteDatasByAffiliateCode(code: string): Promise<any>
    {
        return await this.prisma.athlete.findUnique({where:{affiliateCode: code}, include:{academy:{
            select:{
                id: true,
                name: true,
                logoUrl: true,
                address: true,
                province: true,
                city: true,
                affiliateNumber: true,
            }
        },
        payments:{
            select:{
                id: true, 
                amount: true,
                paidAt: true,
                status: true,
                referenceMonth: true,
            }
        }
    }})
    }
    async deleteAthlete(id: string, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
    {
        const client = tx ?? this.prisma
        return await client.athlete.delete({where:{id: id}})
    }
    async updateAthlete(id: string, datas: UpdateAthleteRequestDto, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any> {
        const client = tx ?? this.prisma
        return await client.athlete.update({where:{id: id}, data: {
            ...datas
        }})
    }
    // Repositório
async getAllAtheles(filters: {
  page:          number;
  limit:         number;
  academyId?:    string;
  affiliateCode?: string;
}): Promise<any> {
  const { page, limit, academyId, affiliateCode } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.AthleteWhereInput = {
    ...(academyId     && { academyId }),
    ...(affiliateCode && { affiliateCode }),
  };

  const [total, athletes] = await this.prisma.$transaction([
    this.prisma.athlete.count({ where }),
    this.prisma.athlete.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: "desc" },
      select: {
        id:             true,
        fullName:       true,
        currentBelt:    true,
        currentDegree:  true,
        birthDate:      true,
        affiliateCode:  true,
        photoUrl:       true,
        enrolledAt:     true,
        emergencyPhone: true,
        email:          true,
        phone:          true,
        isActive:       true,
        academy:
        {
            select:{
                id: true,
                name: true,
                affiliateNumber: true,
                logoUrl: true,
                type: true
            }
        },
        graduations: {
          select: {
            id:        true,
            fromBelt:  true,
            toBelt:    true,
            fromDegree: true,
            toDegree:  true,
            status: true
          },
        },
        attendances: {
          select: {
            id:        true,
            present:   true,
            classDate: true,
          },
        },
        payments: {
          select: {
            id:             true,
            amount:         true,
            paidAt:         true,
            referenceMonth: true,
            status:         true,
          },
        },
      },
    }),
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data:       athletes,
  };
}
        async deleteAthele(id: string, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any> {
            const client = tx ?? this.prisma
            return await client.athlete.delete({where:{id: id}})
        }
        async registerAthelePayment(datas: CreatePaymentDto): Promise<any> {
            return await this.prisma.athelePayment.create({
                data:{
                    athleteId: datas.athleteId,
                    amount: datas.amount,
                    referenceMonth: datas.referenceMonth,
                    status: "PENDING",
                    paidAt: datas.paidAt
                }
            })
        }
        async getAllAthelePayments(filters:{limit: number, page: number, academyId: string}): Promise<any>
        {
            const { page, limit, academyId } = filters;
            const skip = (page - 1) * limit;
            const [total, payments] = await this.prisma.$transaction([
                this.prisma.athelePayment.count({where:{athlete:{academy:{id: academyId}}} }),
                this.prisma.athelePayment.findMany({
                    where:{athlete:{academy: {id: academyId}}},
                    skip,
                    take:    limit,
                    orderBy: { createdAt: "desc" },
                    select: {
                        athlete:{
                            select:{
                                id:             true,
                                fullName:       true,
                                currentBelt:    true,
                                currentDegree:  true,
                                birthDate:      true,
                                affiliateCode:  true,
                                photoUrl:       true,
                                enrolledAt:     true,
                                emergencyPhone: true,
                                email:          true,
                                phone:          true,
                                isActive:       true,
                                academy: {
                                    select:{
                                        id: true,
                                        name: true,
                                        logoUrl: true,
                                        affiliateNumber: true
                                    }
                                },
                            }
                        }
                    },
                }),
            ]);
            return {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                data:       payments,
            };
        }
        async getAthelePayments(filters:{limit: number, page: number, atheleId: string}): Promise<any>
        {
            const { page, limit, atheleId } = filters;
            const skip = (page - 1) * limit;
            const [total, payments] = await this.prisma.$transaction([
                this.prisma.athelePayment.count({where:{athleteId: atheleId}}),
                this.prisma.athelePayment.findMany({
                    where:{athleteId: atheleId},
                    skip,
                    take:    limit,
                    orderBy: { createdAt: "desc" },
                    select: {
                        athlete:{
                            select:{
                                id:             true,
                                fullName:       true,
                                currentBelt:    true,
                                currentDegree:  true,
                                birthDate:      true,
                                affiliateCode:  true,
                                photoUrl:       true,
                                enrolledAt:     true,
                                emergencyPhone: true,
                                email:          true,
                                phone:          true,
                                isActive:       true,
                                academy: {
                                    select:{
                                        id: true,
                                        name: true,
                                        logoUrl: true,
                                        affiliateNumber: true
                                    }
                                },
                            }
                        }
                    },
                }),
            ]);
            return {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                data:       payments,
            };
        }
    }

export { PrismaAthelesRepositories };