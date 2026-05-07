import {Module} from "@nestjs/common";
import { CacheService } from "./cache.service";
import { AcademiesModule } from "../Academies/academies.module";

@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}