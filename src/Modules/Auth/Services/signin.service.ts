import { Injectable, Inject, UnauthorizedException, InternalServerErrorException} from "@nestjs/common";
import { AutehticationsDto } from "../authentications.dto";
import * as bcrypt from "bcrypt"
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";
import { JwtOperations } from "src/Common/Utils/AuthenticationsProcols/JwtOperations/operations";
import { PrismaService } from "../../../lib/prisma.service";
import { InitAuthenticationsService } from "./init-authentications.service";
import { RegisterTokensService } from "./register-tokens.service";

@Injectable()
class SignInService
{
        private accessTokenDate: number = 15 * 60 * 1000
        private refreshTokenDate: number = 7*24*60*60*1000
    constructor(
        @Inject(IAuthenticationRepositories)
        private readonly repository: IAuthenticationRepositories,
        private readonly prisma: PrismaService,
        private readonly initAuthenticationsService: InitAuthenticationsService,
        private readonly registerTokensService: RegisterTokensService
    ){}

    async signin(datas: AutehticationsDto)
    {
        try
        {
            const account = await this.repository.signIn({email: datas.email, password: datas.password})
            if(!account)
            {
                throw new UnauthorizedException("Credencias inválidas")
            }
            if(account.academy && account.academy.status === "PENDING")
            {
                throw new UnauthorizedException("O registro da sua academia ainda não foi aprovada pela central, por favor aguarde.")
            }
            const isValidPassword = await bcrypt.compare(datas.password, account.passwordHash)
            if (!isValidPassword)
            {
                throw new UnauthorizedException("Credencias inválidas.")
            }
            let payload
            if(account.academy)
            {
                payload = {sub: account.academy.id, role: account.academy.type}
            }
            else if(account.user)
            {
                payload = {sub: account.user.id, role: account.user.role}
            }
            else
            {
                throw new UnauthorizedException("Conta sem perfil associado. Contacte o administrador.");
            }
            const accessToken = await JwtOperations.GenerateToken(payload, "access")
            const refreshToken = await JwtOperations.GenerateToken(payload, "refreshToken")

            await this.prisma.$transaction(async(tx)=>{
                const authentication = await this.initAuthenticationsService.initAuthentication({
                    type: "by_token",
                    used:false,
                    expireIn: new Date(Date.now() + this.refreshTokenDate),
                    accountId: account.id
                }, tx)
                await this.registerTokensService.registerTokens({
                    token: refreshToken,
                    token_type: "REFRESH",
                    authenticationId: authentication.id,
                }, tx)
            })
            return {
                success: true,
                statusCode: 200, 
                message:"Login realizado com sucesso",
                datas:{
                accessToken: accessToken,
                refreshToken: refreshToken
                }
            }  
        } catch (error: any)
        {
            if(error instanceof UnauthorizedException)
            {
                throw error
            }
            console.log(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }
}
export{SignInService}