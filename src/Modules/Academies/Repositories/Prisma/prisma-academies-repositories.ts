import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../../../lib/prisma.service';
import { AcademyStatus, Prisma } from "generated/prisma/client";
import { IAcademiesRepositories } from "../IAcademies-repositories";
import { CreateAcademyDto } from "../../Dtos/create-academy.dto";
import { UpdateAcademyRequestDto } from "../../Dtos/update-academy.dto";
import { SearchDataInterface } from "src/Common/Utils/search-data-interface";
import { AcademyType } from "generated/prisma/client";
@Injectable()
class PrismaAcademiesRepositories implements IAcademiesRepositories
{
  constructor(private readonly prisma: PrismaService){}

  async createAcademy(datas: CreateAcademyDto, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
  {
    const client = tx ?? this.prisma
    return await client.academy.create({data: {
        name: datas.name,
        type: datas.type!,
        address: datas.address,
        province: datas.province,
        city: datas.city,
        accountId: datas.accountId,
        logoUrl: datas.logoUrl,
        affiliateNumber: datas.affiliateNumber,
        status: AcademyStatus.PENDING
    }})
  }

  async findAcademyById(mode: SearchDataInterface,id?: string, name?: string): Promise<any>
  {
    if(mode.action === "OnlyBasicsDatas")
    {
        if(id)
        {
            return await this.prisma.academy.findUnique({where:{id: id}, include:{account: true}})
        }
        return await this.prisma.academy.findFirst({where:{name: name}, include:{account: true}})
    }
    else if(id)
    {
        return await this.prisma.academy.findUnique({where:{id: id}, omit: {accountId: true},
            include:{
                account: {
                    select:{
                        id: true,
                        email: true,
                        phone: true,
                        isActive: true,
                        isVerified: true,
                    }}, 
                    athletes:{
                        select:{
                            id: true,
                            fullName: true,
                            phone: true,
                            photoUrl: true,
                            email: true,
                            affiliateCode: true,
                            birthDate: true,
                            currentBelt: true,
                            isActive: true,
                            enrolledAt: true
                        }
                    },subscription: {
                        select: {
                            status:          true,
                            currentPeriodStart: true,
                            amount: true,
                            currentPeriodEnd: true,
                        },
                    },
                 }})
    }
        return await this.prisma.academy.findFirst({where:{name: name}, 
                omit: {accountId: true},
            include:{
                account: {
                    select:{
                        id: true,
                        email: true,
                        phone: true,
                        isActive: true,
                        isVerified: true,
                    }}, 
                    athletes:{
                        select:{
                            id: true,
                            fullName: true,
                            phone: true,
                            photoUrl: true,
                            email: true,
                            affiliateCode: true,
                            birthDate: true,
                            currentBelt: true,
                            isActive: true,
                            enrolledAt: true
                        }
                    },subscription: {
                        select: {
                            status:          true,
                            currentPeriodStart: true,
                            amount: true,
                            currentPeriodEnd: true,
                        },
                    },
                 }})
  }
  async setAcademyStatus(id: string, status: AcademyStatus): Promise<any> {
    return await this.prisma.academy.update({where:{id: id}, data:{status: status, approvedAt: status === AcademyStatus.ACTIVE ? new Date() : undefined}})
  }
  async updateAcademy(id: string, datas: UpdateAcademyRequestDto, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any> {
      return await this.prisma.academy.update({where:{id: id},
         data: {
      // Campos directos da academia
      ...(datas.name     && { name:     datas.name }),
      ...(datas.address  && { address:  datas.address }),
      ...(datas.province && { province: datas.province }),
      ...(datas.city     && { city:     datas.city }),
      ...(datas.logoUrl  && { logoUrl:  datas.logoUrl }),

      // Email e phone pertencem ao Account — actualiza via relação
      ...((datas.email || datas.phone || datas.newPassword) && {
        account: {
          update: {
            ...(datas.email && { email: datas.email }),
            ...(datas.phone && { phone: datas.phone }),
            ...(datas.newPassword) && {passwordHash: datas.newPassword }
          },
        },
      }),
    },
    })
  }
    async deleteAcademy(id: string, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any> {
        const client = tx ?? this.prisma
        return await client.academy.delete({where:{id: id}})
    }
    // Repositories/Prisma/prisma-academies.repositories.ts
    async findAllAcademies(filters: {status?: AcademyStatus;type?:AcademyType;page:number;limit:number;}): Promise<any> {
        const { status, type, page, limit } = filters;
        const skip = (page - 1) * limit;
        const where: Prisma.AcademyWhereInput = {
            ...(status && { status }),
            ...(type   && { type: type as any }),
        };
        const [total, academies] = await this.prisma.$transaction([
            this.prisma.academy.count({ where }),
            this.prisma.academy.findMany({
                where,skip,
                take:    limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id:              true,
                    name:            true,
                    type:            true,
                    status:          true,
                    affiliateNumber: true,
                    logoUrl:         true,
                    province:        true,
                    city:            true,
                    createdAt:       true,
                    account: {
                        select: {
                            email:    true,
                            phone:    true,
                            isActive: true,
                        },
                    },
                    athletes: {
                        select: {
                            id:       true,
                            fullName: true,
                            currentBelt: true,
                            currentDegree: true,
                            birthDate: true,
                            affiliateCode: true,
                            photoUrl: true,
                            enrolledAt: true,
                            emergencyPhone: true,
                            graduations: {
                                select: {
                                    id: true,
                                    fromBelt: true,
                                    toBelt: true,
                                    fromDegree: true,
                                    toDegree: true,
                                },
                            },
                            attendances: {
                                select: {
                                    id: true,
                                    present: true,
                                    classDate: true,
                                },
                            },
                            payments: {
                                select: {
                                    id: true,
                                    amount: true,
                                    paidAt: true,
                                    referenceMonth: true,
                                    status: true,
                                },
                            },
                            email:    true,
                            phone:    true,
                            isActive: true,
                        },
                    },subscription: {
                        select: {
                            status:          true,
                            currentPeriodStart: true,
                            amount: true,
                            currentPeriodEnd: true,
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
            data:       academies,
        };
    }

async getAffiliateReport(academyId: string) {
  const [
    totalAthletes,
    activeAthletes,
    totalPaymentsPaid,
    totalPaymentsOverdue,
    totalGraduations,
    completedGraduations,
    eligibleGraduations,
    totalAttendances,
    totalChampionships,
  ] = await Promise.all([
    this.prisma.athlete.count({ where: { academyId } }),
    this.prisma.athlete.count({ where: { academyId, isActive: true } }),
    this.prisma.athelePayment.count({ where: { athlete:{academy:{id: academyId}}, status: 'PAID' } }),
    this.prisma.athelePayment.count({ where: { athlete:{academy:{id: academyId}}, status: 'OVERDUE' } }),
    this.prisma.graduation.count({ where: { academyId } }),
    this.prisma.graduation.count({ where: { academyId, status: 'APPROVED' } }),
    this.prisma.graduation.count({ where: { academyId, status: 'NOT_APPROVED' } }),
    this.prisma.attendance.count({
      where: {
        academyId,
        classDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    this.prisma.championship.count(),
  ]);

  const [revenueResult, beltDistribution] = await Promise.all([
    this.prisma.athelePayment.aggregate({
      where: { athlete:{academy:{id: academyId}}, status: 'PAID' },
      _sum: { amount: true },
    }),
    this.prisma.athlete.groupBy({
      by: ['currentBelt'],
      where: { academyId, isActive: true },
      _count: { id: true },
    }),
  ]);

  return {
    athletes: {
      total: totalAthletes,
      active: activeAthletes,
      inactive: totalAthletes - activeAthletes,
      beltDistribution: beltDistribution.map(b => ({
        belt: b.currentBelt,
        count: b._count.id,
      })),
    },
    financial: {
      totalPaidPayments: totalPaymentsPaid,
      totalOverduePayments: totalPaymentsOverdue,
      totalRevenue: revenueResult._sum.amount ?? 0,
    },
    graduations: {
      total: totalGraduations,
      completed: completedGraduations,
      eligible: eligibleGraduations,
    },
    attendance: {
      currentMonth: totalAttendances,
    },
    championships: {
      totalAthletesRegistered: totalChampionships,
    },
  };
}

async getCentralReport() {
  const [
    // --- Afiliadas ---
    totalAffiliates,
    activeAffiliates,
    suspendedAffiliates,
    pendingAffiliates,

    // --- Subscrições ---
    subscriptionsPastDue,
    subscriptionsSuspended,

    // --- Atletas (toda a rede) ---
    totalAthletesCentral,
    activeAthletesCentral,

    // --- Graduações (toda a rede) ---
    totalGraduationsCentral,
    completedGraduationsCentral,
    eligibleGraduationsCentral,

    // --- Presenças (mês corrente, toda a rede) ---
    totalAttendancesCentral,

    // --- Campeonatos (toda a rede) ---
    totalChampionshipsCentral,

  ] = await Promise.all([
    // Afiliadas
    this.prisma.academy.count({ where: { type: 'AFFILIATE' } }),
    this.prisma.academy.count({ where: { type: 'AFFILIATE', status: 'ACTIVE' } }),
    this.prisma.academy.count({ where: { type: 'AFFILIATE', status: 'SUSPENDED' } }),
    this.prisma.academy.count({ where: { type: 'AFFILIATE', status: 'PENDING' } }),

    // Subscrições
    this.prisma.subscription.count({ where: { status: 'PAST_DUE' } }),
    this.prisma.subscription.count({ where: { status: 'SUSPENDED' } }),

    // Atletas
    this.prisma.athlete.count(),
    this.prisma.athlete.count({ where: { isActive: true } }),

    // Graduações
    this.prisma.graduation.count(),
    this.prisma.graduation.count({ where: { status: 'APPROVED' } }),
    this.prisma.graduation.count({ where: { status: 'NOT_APPROVED' } }),

    // Presenças (mês corrente)
    this.prisma.attendance.count({
      where: {
        classDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),

    // Campeonatos
    this.prisma.championship.count(),
  ]);

  // --- Receita total da rede (sem quebra por afiliada) ---
  const revenueCentral = await this.prisma.athelePayment.aggregate({
    where: { status: 'PAID' },
    _sum: { amount: true },
  });

  // --- Pagamentos em atraso na rede ---
  const [totalPaidCentral, totalOverdueCentral] = await Promise.all([
    this.prisma.athelePayment.count({ where: { status: 'PAID' } }),
    this.prisma.athelePayment.count({ where: { status: 'OVERDUE' } }),
  ]);

  return {
    affiliates: {
      total: totalAffiliates,
      active: activeAffiliates,
      suspended: suspendedAffiliates,
      pending: pendingAffiliates,
    },
    subscriptions: {
      pastDue: subscriptionsPastDue,
      suspended: subscriptionsSuspended,
      healthy: totalAffiliates - subscriptionsPastDue - subscriptionsSuspended,
    },
    athletes: {
      total: totalAthletesCentral,
      active: activeAthletesCentral,
      inactive: totalAthletesCentral - activeAthletesCentral,
    },
    financial: {
      totalPaidPayments: totalPaidCentral,
      totalOverduePayments: totalOverdueCentral,
      totalRevenue: revenueCentral._sum.amount ?? 0,
    },
    graduations: {
      total: totalGraduationsCentral,
      completed: completedGraduationsCentral,
      eligible: eligibleGraduationsCentral,
    },
    attendance: {
      currentMonth: totalAttendancesCentral,
    },
    championships: {
      totalAthletesRegistered: totalChampionshipsCentral,
    },
  };
}
}

export { PrismaAcademiesRepositories };