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
        console.log(datas)
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
        return await this.prisma.account.update({where:{id: id_account}, data:{
            ...datas,
            passwordHash: datas.password
        }})
    }
}
export{PrismaAccountsRepositories}