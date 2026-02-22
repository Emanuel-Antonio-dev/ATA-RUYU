import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";
import { PrismaService } from "src/lib/prisma.service";
import { JwtOperations } from "src/Common/Utils/AuthenticationsProcols/JwtOperations/operations";
@Injectable()
class RefreshTokenService
{
    private REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000
    constructor(
        @Inject(IAuthenticationRepositories) 
        private readonly repository: IAuthenticationRepositories,
        @Inject(JwtOperations)
        private readonly jwtOperations: JwtOperations,
        private readonly prisma: PrismaService,
    ){}

    async refreshToken(token: string)
    {
        try
        {
            if(!token)
            {
                throw new BadRequestException("Parâmetros de autenticação não fornecido.")
            }
            const storedToken = await this.repository.getTokenDatas(token, "REFRESH")
            if(!storedToken || !storedToken.authentication || storedToken.authentication?.used)
            {
                throw new UnauthorizedException("Verificação de sessão inválida ou parâmetros de autenticação já utilizado.")
            }
            if(storedToken.authentication.expireIn < new Date())
            {
                throw new UnauthorizedException("Sessão expirada.")
            }
            const decodedToken = JwtOperations.VerifyToken(token)
            if(!decodedToken)
            {
                throw new UnauthorizedException("Sessão inválida.")
            }
            const newAccessToken = await JwtOperations.GenerateToken({sub: decodedToken.sub, role: decodedToken.role}, "access")
            const newRefreshToken = await JwtOperations.GenerateToken({sub: decodedToken.sub, role: decodedToken.role}, "refreshToken")
            const accountId = storedToken.authentication.accountId || storedToken.authentication.account?.accountId
            if(!accountId)
            {
                throw new UnauthorizedException("Sessão inválida.")
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.authentication.delete({where: { id: storedToken.authentication.id }})
              //await tx.tokens.delete({ where: { token: refreshToken } })

              const newAuth = await this.repository.initAuthentication({
                type: "by_token",
                used: false,
                expireIn: new Date(Date.now() + this.REFRESH_TOKEN_TTL),
                accountId: accountId
              }, tx)

              await this.repository.registerToken({
                token: newRefreshToken,
                token_type: "REFRESH",
                authenticationId: newAuth.id
              }, tx)
            })
            return {success: true, statusCode: 200, message: "Novo token de acesso gerado com sucesso", datas: {accessToken: newAccessToken, refreshToken: newRefreshToken}}
        } catch (error: any)
        {
            if(error instanceof HttpException)
            {
                throw error
            }
            console.log(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente mais tarde.")
        }
    }
}
export{RefreshTokenService}