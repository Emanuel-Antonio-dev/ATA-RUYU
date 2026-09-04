import { HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { IAccountsRepositories } from "../Repositories/IAccounts-repositories";

@Injectable()
class SoftDeleteAccountService
{
    constructor(
        @Inject(IAccountsRepositories) private readonly accountRepository: IAccountsRepositories
    ){}

    async softDeleteAccount(email: string)
    {
        try
        {
            const existsAccount = await this.accountRepository.getAccountDatas(undefined, email, undefined)
            if(!existsAccount)
            {
                throw new NotFoundException("Não conseguimos encontrar este perfil.")
            }
            await this.accountRepository.softDeleteForAccount(email)
            return {statusCode: 200, status: true, message: "Conta deletada com sucesso."}
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
export{SoftDeleteAccountService}