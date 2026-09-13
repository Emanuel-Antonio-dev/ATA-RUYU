import {Module} from "@nestjs/common";
import { CacheService } from "./cache.service";

// ✅ Achado desta auditoria: importava `AcademiesModule` sem nunca o usar
// (CacheService não depende de nada de lá) — e `AcademiesModule` importa
// `CacheModule`, o que criava uma dependência circular entre os dois
// módulos, só por causa deste import morto.
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}