import { PrismaService } from "src/lib/prisma.service";
import { IAtheleRepositories } from "../IAthlete-repositories";
import { Injectable, Inject, NotFoundException, HttpException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { Prisma } from "generated/prisma/client";
import { CreateAthleteDto } from "../../Dtos/create-athlete.dto";
import { UpdateAthleteDto, UpdateAthleteRequestDto } from "../../Dtos/update-thlete.dto";
import { generateAffiliateCode } from "src/Common/Utils/generate-codes";

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
                dueDate: true
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
                dueDate: true
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
            dueDate:        true,
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
}

export { PrismaAthelesRepositories };