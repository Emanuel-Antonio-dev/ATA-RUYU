import { IAccountsRepositories } from '../../Accounts/Repositories/IAccounts-repositories';
import { IAuthenticationRepositories } from '../Repositories/IAuthentication-repositoties';
import * as bcrypt from 'bcrypt';
import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ResetPasswordDto } from '../authentications.dto';

@Injectable()
class ResetPasswordService
{
    constructor(
        @Inject(IAccountsRepositories)
        private readonly acountRepository: IAccountsRepositories,
        @Inject(IAuthenticationRepositories)
        private readonly authenticationRepository: IAuthenticationRepositories
    ){}
    async ResetPassword(newPassword: ResetPasswordDto, token: string)
    {
        try
        {
            if(!token)
            {
                throw new BadRequestException("Informe todos os campos")
            }
            const isValidToken = await this.authenticationRepository.getTokenDatas(token, "PASSWORD_RESET")
            if (!isValidToken || isValidToken.authentication.expireIn < new Date() || isValidToken.authentication.used)
            {
               throw new BadRequestException("Infelizmente o seu tempo para alterar a senha expirou, por favor tente novamente." )
            }
            const passwordHashed = await bcrypt.hash(newPassword.newPassword, 12)
            await this.acountRepository.editAccountDatas(isValidToken.authentication.account.id, {password: passwordHashed.trim()})
            await this.authenticationRepository.deleteTokenDatas(token)
            
            if (!isValidToken)
            {
                throw new InternalServerErrorException("Não conseguimos realizar esta operação, tente novamente!")
            }

            return {statusCode: 200, success: true, message: "Senha alterada com sucesso."}
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
export{ResetPasswordService}