import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "src/Common/Decorators/public.decorator";
import { SKIP_SUBSCRIPTION_CHECK_KEY } from "src/Common/Decorators/skip-subscription-check.decorator";
import { IAcademiesRepositories } from "src/Modules/Academies/Repositories/IAcademies-repositories";
import { CacheService } from "src/Modules/Cache/cache.service";
import { CACHE_KEYS, CACHE_TTL } from "src/Modules/Cache/cache.constants";
import { Role } from "./roles.enum";

/**
 * ✅ Achado desta auditoria: o cron `SuspendOverdueSubscriptionsCron` muda
 * `academy.status` para SUSPENDED, mas nada no resto da aplicação alguma
 * vez lia esse valor — nem sequer o login (que só bloqueava PENDING). Uma
 * academia suspensa por falta de pagamento continuava a ter acesso total à
 * plataforma, tornando toda a mecânica de suspensão cosmética. Este guard
 * corre depois de `JwtAuthGuard`/`RolesGuard` e bloqueia qualquer pedido de
 * uma conta ligada a uma academia SUSPENDED — incluindo sessões já activas
 * (access token de 15 min / refresh de 7 dias emitidos antes da suspensão),
 * não só logins novos.
 *
 * CENTRAL e ADMIN_DEV nunca são bloqueados (não pertencem a uma academia).
 * Rotas marcadas com `@SkipSubscriptionCheck()` também não são bloqueadas —
 * uma academia suspensa continua a precisar de conseguir consultar o que
 * deve, pagar, e sair da sessão.
 */
@Injectable()
export class SubscriptionStatusGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(IAcademiesRepositories)
    private readonly academyRepository: IAcademiesRepositories,
    private readonly cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_SUBSCRIPTION_CHECK_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest();
    const credentials = request.credentials;

    // sem credenciais (não devia acontecer numa rota não-pública, mas o
    // JwtAuthGuard já teria recusado antes de chegar aqui) ou conta sem
    // academia (CENTRAL/ADMIN_DEV) — nada a verificar
    if (!credentials || !credentials.academyId) {
      return true;
    }

    const cacheKey = CACHE_KEYS.subscriptionStatus(credentials.academyId);
    const { data: status } = await this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const academy = await this.academyRepository.findAcademyById(
          { action: "OnlyBasicsDatas" },
          credentials.academyId,
        );
        return academy?.status ?? null;
      },
      CACHE_TTL.ACADEMY_STATUS_CHECK,
    );

    if (status === "SUSPENDED") {
      throw new ForbiddenException(
        "A subscrição da sua academia está suspensa por falta de pagamento. Regularize a situação para recuperar o acesso.",
      );
    }

    return true;
  }
}
