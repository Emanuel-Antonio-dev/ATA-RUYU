import { Prisma, TokenTypes } from "generated/prisma/client";
import { IAuthenticationRepositories } from "../IAuthentication-repositoties";
import { AuthenticationDatas, OtpCodeDatas, TokenDatas } from "../../Interfaces/interface";
import { Injectable, Inject} from "@nestjs/common";
import { AutehticationsDto } from "../../authentications.dto";
import { PrismaService } from "src/lib/prisma.service";

@Injectable()
class PrismaAuthenticationsRepositories implements IAuthenticationRepositories
{
    constructor(private readonly prisma: PrismaService){}

    async signIn(datas: AutehticationsDto, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
    {
        return await this.prisma.account.findUnique({where:{email: datas.email, isActive: true}, include:{authentications: true, academy: {include:{subscription: true}}, user: true}})
    }

    async initAuthentication(datas: AuthenticationDatas, tx: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
    {
        const client = tx ?? this.prisma
        return await client.authentication.create({data:{
            used: datas.used,
            expireIn: new Date(datas.expireIn),
            type: datas.type,
            accountId: datas.accountId,
            temp_email: datas.temp_email,
            temp_phone: datas.temp_phone_number,
        }})    
    }
    async getAuthenticationDatas(id_authentication: string): Promise<any>
    {
        return await this.prisma.authentication.findUnique({where:{id: id_authentication}, include:{twoFactorAuth: true, account: true}})    
    }
    async editAuthenticationDatas(id_authentication: string, used: boolean, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
    {
        const client = tx ?? this.prisma
        return await client.authentication.update({where:{id: id_authentication}, data:{used: used}})    
    }
    async registerToken(datas: TokenDatas, tx: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
    {
        const client = tx ?? this.prisma
        return await client.token.create({
            data:{
                token: datas.token,
                tokenType:datas.token_type,
                authenticationId: datas.authenticationId
            }
        })
    }

    async getTokenDatas(token: string, type_token: TokenTypes): Promise<any> {
        return await this.prisma.token.findUnique({where:{token:token, tokenType: type_token}, include:{authentication:{include:{account: true}}}})
    }
    async deleteTokenDatas(token: string): Promise<any> {
        return await this.prisma.token.delete({where:{token: token}})
    }

    async registerOtpCode(datas: OtpCodeDatas, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
    {
        const client = tx ?? this.prisma
        return await client.twoFactorAuth.create({
            data:{
                otpCodeHash: datas.otp_code,
                authenticationId: datas.authenticationId,
            }
        })
    }
    async getOtpCodeDatas(id_authentication_fk: string): Promise<any>
    {
        return await this.prisma.twoFactorAuth.findUnique({where:{authenticationId: id_authentication_fk}, include:{authentication:{include:{account: true}}}})
    }
    async deleteOtpCodeDatas(id_two_factor_auth: string, tx?: Omit<Prisma.TransactionClient, "$transaction"> ): Promise<any>
    {
        const client = tx ?? this.prisma
        return await client.twoFactorAuth.delete({where:{id: id_two_factor_auth}})
    }
    async invalidateActiveAuthentications(params: { email?: string; phone_number?: string },tx?: Omit<Prisma.TransactionClient, "$transaction">):Promise<any>
    {
        const client = tx ?? this.prisma;
        
        const activeAuthentications = await client.authentication.findMany({where: {used: false,
            expireIn: {gt: new Date(),},OR: [params.email ? { temp_email: params.email } : undefined,params.phone_number ? { phone_number: params.phone_number } : undefined,].
            filter(Boolean) as any,},include: {twoFactorAuth: true,},});
            if (!activeAuthentications.length)
                {
                    return;
                }
                for (const auth of activeAuthentications)
                {
                    await client.authentication.update({where: { id: auth.id },data: { used: true },
                });
                if (auth.twoFactorAuth)
                {
                    await client.twoFactorAuth.delete({where: {id:auth.twoFactorAuth.id,},
                });
            }
        }
    }
        async findValidOtp(params: { email?: string; phone_number?: string }):Promise<any> {
            return this.prisma.twoFactorAuth.findFirst({where: {locked: false,authentication: {used: false,expireIn: { gt: new Date() },
            OR: [params.email ? { temp_email: params.email } : undefined,params.phone_number ? { temp_phone_number: params.phone_number } : undefined,].filter(Boolean) as any,},
        },
        include: {authentication: true},});}
        
        async incrementOtpAttempts(id_two_factor_auth: string, tx: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
        {
            const client = tx ?? this.prisma
            return await client.twoFactorAuth.update({where:{id:id_two_factor_auth }, data:{
                attempts: {increment: 1}
            }})
        }
        async lockOtpCode(id_two_factor_auth: string, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
        {
            const client = tx ?? this.prisma;
            return await client.twoFactorAuth.update({where:{id: id_two_factor_auth}, data:{locked: true}})    
        }
        
async getAcademy(id: string) {
  return this.prisma.academy.findUnique({
    where: { id },
    select: {
      id:              true,
      name:            true,
      type:            true,
      status:          true,
      affiliateNumber: true,
      logoUrl:         true,
      address:         true,
      province:        true,
      city:            true,
      approvedAt:      true,
      createdAt:       true,

      // Credenciais de acesso
      account: {
        select: {
          email:      true,
          phone:      true,
          isActive:   true,
          isVerified: true,
        },
      },

      // Subscrição activa
      subscription: {
        select: {
          status:           true,
          amount:           true,
          currency:         true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
        },
      },

      // Utilizadores da academia (admins, instrutores, mestres)
      users: {
        where:  { isActive: true },
        select: {
          id:       true,
          fullName: true,
          role:     true,
          photoUrl: true,
        },
      },

      // Resumo de atletas
      athletes: {
        where:  { isActive: true },
        select: {
          id:           true,
          fullName:     true,
          currentBelt:  true,
          currentDegree: true,
          enrolledAt:   true,
        },
      },
    },
  });
}
}
export{PrismaAuthenticationsRepositories}