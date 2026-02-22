import { IAccountsRepositories } from "../../Accounts/Repositories/IAccounts-repositories";
import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";
import { HttpException, InternalServerErrorException } from "@nestjs/common";
import * as crypto from 'node:crypto';
import { PrismaService } from "src/lib/prisma.service";
import { SendEmailService } from "src/Modules/Emails/send-email.service";

import { RequestPasswordDto } from "../authentications.dto";

@Injectable()
class RequestNewPasswordService
{
    constructor(
        private readonly prisma: PrismaService,
        @Inject(IAccountsRepositories)
        private readonly accountRepositories: IAccountsRepositories,
        @Inject(IAuthenticationRepositories)
        private readonly authenticationRepositories: IAuthenticationRepositories,
        private readonly emailSender: SendEmailService
    ){}

    async requestNewPassword(data: RequestPasswordDto)
    {
        try
        {
            const existsAccount = await this.accountRepositories.getAccountDatas(undefined, data.email)
            if(!existsAccount)
            {
                throw new NotFoundException("Não conseguimos encontrar esta conta.")
            }
             const restPasswordToken = crypto.randomBytes(32).toString("hex")
            await this.prisma.$transaction(async(tx)=>{
                const authentication = await this.authenticationRepositories.initAuthentication({
                    type:"by_token",
                    used:false,
                    expireIn: new Date(Date.now() + 3600000),
                    accountId: existsAccount.id_account
                }, tx)
                if (!authentication)
                {
                    throw new Error()
                }
                const registerToken = await this.authenticationRepositories.registerToken({
                    token: restPasswordToken,
                    token_type: "PASSWORD_RESET",
                    authenticationId: authentication.id_authentication,
                }, tx)
                if (!registerToken)
                {
                    throw new Error()
                }
            })
            await this.emailSender.sendEmail(data.email, "Pedido de recuperação de senha.", `<p>${restPasswordToken}</p>`)

            return {statusCode: 200, success: true, message:`Enviamos um email para ${data.email}, por favor verifique a sua caixa de email`,  ...(process.env.NODE_ENV=="test" ? {token: restPasswordToken} : {})}

        } catch (error: any)
        {
            if(error instanceof HttpException)
            {
                throw error
            }
            console.log(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }
}
export{RequestNewPasswordService}