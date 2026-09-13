import { IAccountsRepositories } from "../../Accounts/Repositories/IAccounts-repositories";
import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";
import { HttpException, InternalServerErrorException } from "@nestjs/common";
import * as crypto from 'node:crypto';
import { PrismaService } from "src/lib/prisma.service";
import { SendEmailService } from "src/Modules/Emails/send-email.service";
import { hashKey } from "src/Common/Utils/generate-codes";
import { renderPasswordResetEmail } from "src/Modules/Emails/Templates/password-reset.template";

import { RequestPasswordDto } from "../authentications.dto";

// ✅ V-09 FIX: resposta genérica, sempre a mesma, exista ou não a conta —
// evita a enumeração de emails registados (ver requestNewPassword abaixo).
const GENERIC_RESPONSE = {
    statusCode: 200,
    success: true,
    message: "Se este email estiver registado, enviamos instruções de recuperação para a caixa de entrada.",
};

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
            // ✅ V-09(a) FIX: antes lançava 404 para email inexistente e
            // sucesso para email existente — combinado com a ausência de
            // rate limiting (V-08), permitia mapear todos os emails
            // registados na plataforma. Agora devolve sempre a mesma
            // resposta; o trabalho real só acontece se a conta existir.
            if(!existsAccount)
            {
                return GENERIC_RESPONSE;
            }
             const restPasswordToken = crypto.randomBytes(32).toString("hex")
            await this.prisma.$transaction(async(tx)=>{
                const authentication = await this.authenticationRepositories.initAuthentication({
                    type:"by_token",
                    used:false,
                    expireIn: new Date(Date.now() + 3600000),
                    accountId: existsAccount.id
                }, tx)
                if (!authentication)
                {
                    throw new Error()
                }
                // ✅ V-09(b) FIX: o token era guardado em claro em
                // tbl_tokens.token — qualquer leitura da BD (backup, acesso
                // de operador, etc.) permitia tomar a conta directamente.
                // Agora guarda-se sha256(token), exactamente como já era
                // feito (correctamente) para as chaves de download — o
                // valor em claro só existe no email enviado ao dono da
                // conta, nunca em disco.
                const registerToken = await this.authenticationRepositories.registerToken({
                    token: hashKey(restPasswordToken),
                    token_type: "PASSWORD_RESET",
                    authenticationId: authentication.id,
                }, tx)
                if (!registerToken)
                {
                    throw new Error()
                }
            })
            // ✅ achado desta auditoria: o email mostrava só o token cru
            // (`<p>${token}</p>`), sem explicação nem link clicável — o
            // utilizador tinha de copiar o token manualmente para algum
            // sítio. Agora usa o template com botão, com o token embutido
            // no link. Requer a env var FRONTEND_URL (ex:
            // https://app.ata-ryu.com).
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${restPasswordToken}`
            await this.emailSender.sendEmail(data.email, "Recuperação de senha — ATA-RYU", renderPasswordResetEmail(resetUrl))

            // ✅ V-09(c) FIX: removido o vazamento condicional do token na
            // resposta HTTP quando NODE_ENV === "test" — uma variável de
            // ambiente mal configurada em produção tornava-se tomada de
            // conta trivial para qualquer email. Testes que precisem do
            // token devem lê-lo directamente da base de dados de teste.
            return GENERIC_RESPONSE;

        } catch (error: any)
        {
            if(error instanceof HttpException)
            {
                throw error
            }
            console.error(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }
}
export{RequestNewPasswordService}