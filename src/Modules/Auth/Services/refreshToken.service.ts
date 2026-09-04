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

    async refreshToken(token: string) {
  try {
    if (!token) {
      throw new BadRequestException("Parâmetros de autenticação não fornecido.");
    }

    // 1. Verifica se o token existe
    const storedToken = await this.repository.getTokenDatas(token, "REFRESH");

    if (!storedToken || !storedToken.authentication) {
      throw new UnauthorizedException("Sessão inválida ou token não encontrado.");
    }

    if (storedToken.authentication.used) {
      throw new UnauthorizedException("Token de sessão já utilizado.");
    }

    // 2. Verifica se o refresh token ainda está dentro do TTL
    const isExpired = storedToken.authentication.expireIn < new Date();
    if (isExpired) {
      // Marca como usado para não ser reutilizado
      await this.prisma.authentication.update({
        where: { id: storedToken.authentication.id },
        data:  { used: true },
      });
      throw new UnauthorizedException("Sessão expirada. Faça login novamente.");
    }

    // 3. Decodifica o refresh token — exige explicitamente typ "refresh":
    // sem isto, um access token (ou temp token) também seria aceite aqui.
    const decodedToken = JwtOperations.VerifyToken(token, "refresh");
    if (!decodedToken) {
      throw new UnauthorizedException("Token inválido.");
    }

    const accountId = storedToken.authentication.accountId;
    if (!accountId) {
      throw new UnauthorizedException("Sessão inválida — conta não encontrada.");
    }

    // 4. Gera apenas um novo accessToken
    // O refreshToken permanece o mesmo até expirar
    // ✅ B-12 FIX: `subscriptionStatus` e `academyId` eram omitidos do novo
    // access token — qualquer lógica dependente dessas claims comportava-se
    // de forma diferente 15 minutos após o login (no primeiro refresh).
    const newAccessToken = await JwtOperations.GenerateToken(
      { sub: decodedToken.sub, academyId: decodedToken.academyId, role: decodedToken.role, subscriptionStatus: decodedToken.subscriptionStatus },
      "access",
    );

    // Calcula o tempo restante do refresh token actual
    //const remainingTTL = storedToken.authentication.expireIn.getTime() - Date.now();
    //const remainingDays = Math.ceil(remainingTTL / (1000 * 60 * 60 * 24));

    return {
      success:    true,
      statusCode: 200,
      message:    "Novo token de acesso gerado com sucesso.",
      datas: {
        accessToken:       newAccessToken,
        refreshToken:      token,        // devolve o mesmo refresh token
      },
    };

  } catch (error: any) {
    if (error instanceof HttpException) throw error;
    console.error(error);
    throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente mais tarde.");
  }
}
}
export{RefreshTokenService}