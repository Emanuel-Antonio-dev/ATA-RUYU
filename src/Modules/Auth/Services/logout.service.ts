import { BadRequestException, HttpException, Inject,Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";

@Injectable()
class LogoutService {
  constructor(
    @Inject(IAuthenticationRepositories)
    private readonly repository: IAuthenticationRepositories
  ) {}

  async logout(refreshToken: string) {
    try {
      if (!refreshToken)
      {
        throw new NotFoundException("Ocorreu um erro ao terminar esta sessão.");
      }

      const deleted = await this.repository.deleteTokenDatas(refreshToken);

      if (!deleted)
      {
        throw new InternalServerErrorException("Sessão inválida ou já encerrada.");
      }

      return {
        statusCode: 200,
        success: true,
        message: "Sessão terminada com sucesso, volte sempre!",
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
          console.log(error)
      throw new InternalServerErrorException(
        "Ocorreu um erro interno, tente novamente."
      );
    }
  }
}

export {LogoutService}