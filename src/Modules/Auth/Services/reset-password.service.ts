import { IAccountsRepositories } from '../../Accounts/Repositories/IAccounts-repositories';
import { IAuthenticationRepositories } from '../Repositories/IAuthentication-repositoties';
import * as bcrypt from 'bcrypt';
import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ResetPasswordDto } from '../authentications.dto';
import { hashKey } from 'src/Common/Utils/generate-codes';
import { PrismaService } from 'src/lib/prisma.service';

@Injectable()
class ResetPasswordService
{
    constructor(
        @Inject(IAccountsRepositories)
        private readonly acountRepository: IAccountsRepositories,
        @Inject(IAuthenticationRepositories)
        private readonly authenticationRepository: IAuthenticationRepositories,
        private readonly prisma: PrismaService,
    ){}
    async ResetPassword(newPassword: ResetPasswordDto, token: string)
    {
        try
        {
            if(!token)
            {
                throw new BadRequestException("Informe todos os campos")
            }
            // ✅ V-09(b) FIX: procura pelo hash do token, não pelo valor em
            // claro (que já deixou de ser gravado — ver request-new-password.service.ts)
            const isValidToken = await this.authenticationRepository.getTokenDatas(hashKey(token), "PASSWORD_RESET")
            if (!isValidToken || isValidToken.authentication.expireIn < new Date() || isValidToken.authentication.used)
            {
               throw new BadRequestException("Infelizmente o seu tempo para alterar a senha expirou, por favor tente novamente." )
            }
            const passwordHashed = await bcrypt.hash(newPassword.newPassword, 12)
            const accountId = isValidToken.authentication.account.id;
            await this.acountRepository.editAccountDatas(accountId, {password: passwordHashed.trim()})
            await this.authenticationRepository.deleteTokenDatas(hashKey(token))

            // ✅ V-09(d) FIX: a senha era trocada mas as sessões (refresh
            // tokens) existentes continuavam válidas — um atacante que já
            // tivesse uma sessão activa mantinha acesso até 7 dias, mesmo
            // depois da vítima mudar a senha (exactamente o gesto que se
            // espera que corte o acesso). Invalida todas as autenticações
            // activas da conta.
            await this.prisma.authentication.updateMany({
                where: { accountId, used: false },
                data:  { used: true },
            });

            return {statusCode: 200, success: true, message: "Senha alterada com sucesso."}
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
export{ResetPasswordService}