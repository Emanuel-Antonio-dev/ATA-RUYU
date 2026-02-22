// get-me.service.ts
import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException} from "@nestjs/common";
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";
import { HttpException } from "@nestjs/common";

@Injectable()
class GetCurrenteUserService
{
  constructor(private readonly repository: IAuthenticationRepositories) {}

  async execute(id_user: string)
  {
    try
    {
        const user = await this.repository.getCurrentUser(id_user);

    if (!user)
    {
      throw new NotFoundException("Usuário não encontrado");
    }

    if (!user.account?.isActive)
    {
      throw new ForbiddenException("Conta desativada");
    }

    return {success: true, statusCode: 200, datas: user};    
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
export{GetCurrenteUserService}