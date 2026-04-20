import { PrismaService } from "src/lib/prisma.service";
import { IAthelePaymentsRepositories } from "../IAthlete-repositories";
import { Injectable, Inject, NotFoundException, HttpException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { CreatePaymentDto } from "../../Dtos/create-payment.dto";
import { UpdatePaymentDto, UpdatePaymentRequestBody } from "../../Dtos/update-payment.dto";

@Injectable()
class PrismaAthelePaymentsRepositories implements IAthelePaymentsRepositories
{
    constructor(private readonly prisma: PrismaService){}

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
        async updateAthelePaymentStatus(datas: UpdatePaymentDto): Promise<any> {
            return await this.prisma.athelePayment.update({
                where: { id: datas.id },
                data: {
                    status: datas.status,
                    paidAt: datas.paidAt,
                },
            });
        }
    }

export { PrismaAthelePaymentsRepositories };