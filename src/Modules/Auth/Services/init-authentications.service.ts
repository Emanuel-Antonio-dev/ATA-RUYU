import { HttpException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import  {AuthenticationDatas} from "../Interfaces/interface"
import { Prisma } from "generated/prisma/client";
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";

@Injectable()
class InitAuthenticationsService
{
    constructor( @Inject(IAuthenticationRepositories) private readonly repository: IAuthenticationRepositories){}

    async initAuthentication(datas: AuthenticationDatas, tx: Omit<Prisma.TransactionClient, "$transaction">)
    {
        try
        {
            const result = await this.repository.initAuthentication(datas, tx)
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
            console.log(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }
}
export {InitAuthenticationsService}