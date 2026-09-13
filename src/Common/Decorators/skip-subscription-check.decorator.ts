import { SetMetadata } from "@nestjs/common";

// ✅ Novo achado desta auditoria: suspender uma academia (cron de
// subscrições em atraso) só mudava o valor no BD — login e todos os
// endpoints continuavam a funcionar normalmente para uma academia
// suspensa por falta de pagamento. `SubscriptionStatusGuard` fecha essa
// lacuna, mas alguns endpoints têm de continuar acessíveis mesmo com a
// academia suspensa: consultar o que deve, pagar, e sair da sessão. Sem
// isto, uma academia suspensa ficaria sem nenhuma forma de se reactivar
// a não ser contactar a Central manualmente.
export const SKIP_SUBSCRIPTION_CHECK_KEY = 'skipSubscriptionCheck';
export const SkipSubscriptionCheck = () => SetMetadata(SKIP_SUBSCRIPTION_CHECK_KEY, true);
