import { PrismaAccountsRepositories } from "../Repositories/Prisma/PrismaAccountsRepositories"
import { Injectable, Inject } from '@nestjs/common'
import { AccountDto } from "../register-account.dto"
import { HttpException,
    InternalServerErrorException,
    ConflictException} from "@nestjs/common"
import { IAccountsRepositories } from "../Repositories/IAccounts-repositories"
import { Prisma } from "generated/prisma/client"

@Injectable()
class RegisterAccountService
{
    constructor( @Inject(IAccountsRepositories) private readonly repository: PrismaAccountsRepositories){}
    async registerAccount(datas: AccountDto, tx: Omit<Prisma.TransactionClient, "$transaction">)
    {
        try
        {
            const existsAccount = await this.repository.getAccountDatas(undefined, datas.email)
            if(existsAccount)
            {
                throw new ConflictException("Este e-mail já está sendo usado.")
            }
            const existsPhoneNumber = await this.repository.getAccountDatas(undefined, undefined, datas.phone_number)
            if(existsPhoneNumber)
            {
                throw new ConflictException("Este contacto telefonico já está sendo usado.")
            }
            const result = await this.repository.registerAccount({
                email: datas.email,
                phone_number: datas.phone_number,
                password: datas.password
            }, tx)
            if(!result)
            {
                throw new HttpException("Ocorreu um erro ao criar esta conta", 500)
            }
            return {success: true, statusCode: 201, message:"Conta criada com sucesso.", datas: result}
        } catch (error: any)
        {
            if (error instanceof HttpException)
            {
                throw error
            }
            console.error(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }
}
export{RegisterAccountService}