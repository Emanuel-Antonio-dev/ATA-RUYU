import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";
import { PrismaService } from "src/lib/prisma.service";
import { JwtOperations } from "src/Common/Utils/AuthenticationsProcols/JwtOperations/operations";
import { InitAuthenticationsService } from "./init-authentications.service";
import { RegisterTokensService } from "./register-tokens.service";
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
        private readonly initAuthenticationsService: InitAuthenticationsService,
        private readonly registerTokensService: RegisterTokensService,
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

    // ✅ Achado desta auditoria: não havia rotação de refresh token — o
    // mesmo token era devolvido em todo refresh, válido pelos 7 dias
    // inteiros. Um token roubado continuava utilizável até expirar, e não
    // havia forma de detectar que isso tinha acontecido. Agora: cada
    // refresh emite um refresh token NOVO e marca o antigo como usado. Se
    // um token já marcado como usado for apresentado de novo, é sinal de
    // que alguém está a tentar reutilizar um token já rodado (roubo) — a
    // reacção é revogar TODAS as sessões da conta, forçando novo login em
    // todos os dispositivos.
    if (storedToken.authentication.used) {
      const accountId = storedToken.authentication.accountId;
      if (accountId) {
        await this.prisma.authentication.updateMany({
          where: { accountId, used: false },
          data:  { used: true },
        });
      }
      throw new UnauthorizedException("Sessão inválida. Por segurança, todas as suas sessões foram encerradas — faça login novamente.");
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

    // 4. Gera o novo par access+refresh
    // ✅ B-12 FIX: `subscriptionStatus` e `academyId` eram omitidos do novo
    // access token — qualquer lógica dependente dessas claims comportava-se
    // de forma diferente 15 minutos após o login (no primeiro refresh).
    const payload = { sub: decodedToken.sub, academyId: decodedToken.academyId, role: decodedToken.role, subscriptionStatus: decodedToken.subscriptionStatus };
    const newAccessToken  = JwtOperations.GenerateToken(payload, "access");
    const newRefreshToken = JwtOperations.GenerateToken(payload, "refreshToken");

    // Rotação: marca o refresh actual como usado e regista o par novo
    // numa única transação — se o registo do novo token falhar, o antigo
    // não fica marcado como usado sem substituto (evita perder a sessão).
    await this.prisma.$transaction(async (tx) => {
      await tx.authentication.update({
        where: { id: storedToken.authentication.id },
        data:  { used: true },
      });

      const newAuthentication = await this.initAuthenticationsService.initAuthentication({
        type: "by_token",
        used: false,
        expireIn: new Date(Date.now() + this.REFRESH_TOKEN_TTL),
        accountId,
      }, tx);

      await this.registerTokensService.registerTokens({
        token: newRefreshToken,
        token_type: "REFRESH",
        authenticationId: newAuthentication.id,
      }, tx);
    });

    return {
      success:    true,
      statusCode: 200,
      message:    "Novo token de acesso gerado com sucesso.",
      datas: {
        accessToken:       newAccessToken,
        refreshToken:      newRefreshToken,
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