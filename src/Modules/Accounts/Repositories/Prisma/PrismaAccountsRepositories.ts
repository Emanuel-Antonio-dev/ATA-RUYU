import { PrismaService } from "src/lib/prisma.service";
import { Prisma } from "generated/prisma/client";
import { AccountDto } from "../../register-account.dto";
import { Injectable } from "@nestjs/common";
import { IAccountsRepositories } from "../IAccounts-repositories";
import * as bcrypt from 'bcrypt';

@Injectable()
class PrismaAccountsRepositories implements IAccountsRepositories
{
    constructor(private readonly prisma: PrismaService){}

    async registerAccount(datas: AccountDto, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<AccountDto | any>
    {
        const client = tx ?? this.prisma
        return await client.account.create({
            data:{
                passwordHash: await bcrypt.hash(datas.password, 12),
                email: datas.email,
                phone: datas.phone_number
            }
        })
    }
    async getAccountDatas(id_account?: string, email?: string, phone_number?: string): Promise<any>
    {
        if(id_account)
        {
            return await this.prisma.account.findUnique({where:{id: id_account}})   
        }
        if(phone_number)
        {
            return await this.prisma.account.findUnique({where:{phone: phone_number}})   
        }
        return await this.prisma.account.findUnique({where:{email: email}})   

    }
    async softDeleteForAccount(email: string): Promise<any>
    {
        return await this.prisma.account.update({where:{email: email}, data:{isActive: false}})    
    }
    async editAccountDatas(id_account: string, datas: Partial<AccountDto>): Promise<AccountDto | any> {
        // ✅ B-02 FIX: o `...datas` espalhava as chaves do DTO (`password`,
        // `phone_number`) directamente no `data` do Prisma — nenhuma delas
        // existe no modelo `Account` (que usa `passwordHash` e `phone`).
        // O Prisma rejeitava com "Unknown argument", e ninguém conseguia
        // repor a senha. Agora mapeia explicitamente cada campo suportado.
        return await this.prisma.account.update({where:{id: id_account}, data:{
            ...(datas.email && { email: datas.email }),
            ...(datas.phone_number && { phone: datas.phone_number }),
            ...(datas.password && { passwordHash: datas.password }),
        }})
    }
}
export{PrismaAccountsRepositories}