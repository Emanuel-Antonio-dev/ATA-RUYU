import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import  {AuthenticationDatas, TokenDatas} from "../Interfaces/interface"
import { Prisma } from "generated/prisma/client";
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";

@Injectable()
class RegisterTokensService
{
    constructor( @Inject(IAuthenticationRepositories) private readonly repository: IAuthenticationRepositories){}

    async registerTokens(datas: TokenDatas, tx: Omit<Prisma.TransactionClient, "$transaction">)
    {
        try
        {
            if(!datas.authenticationId || !datas.token || !datas.token_type)
            {
                throw new BadRequestException("Alguns paramêtros não foram enviados.")
            }
            const alreadyExistsRefreshToken = await this.repository.getTokenDatas(datas.token, datas.token_type,)
            if(alreadyExistsRefreshToken)
            {
                await this.repository.deleteTokenDatas(alreadyExistsRefreshToken.id)
            }
            const result = await this.repository.registerToken(datas, tx)
            if(!result)
            {
                throw new HttpException("Ocorreu um erro ao tentar processar alguns paramêtros.", 500)
            }
            return result
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
export {RegisterTokensService}