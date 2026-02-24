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
        type: datas.type,
        address: datas.address,
        province: datas.province,
        city: datas.city,
        accountId: datas.accountId,
        logoUrl: datas.logoUrl,
        affiliateNumber: datas.affiliateCode,
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
                    }
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
                    }
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
                                    dueDate: true
                                },
                            },
                            email:    true,
                            phone:    true,
                            isActive: true,
                        },
                    },
                    subscription: {
                        select: {
                            status:          true,
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
}

export { PrismaAcademiesRepositories };