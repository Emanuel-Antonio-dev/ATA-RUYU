import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';

import { AuthModule } from './Modules/Auth/auth.module';
import { AcademiesModule } from './Modules/Academies/academies.module';
import { AthletePaymentsModule } from './Modules/Atheles-payments/atheles-payments.module';
import { AttendanceModule } from './Modules/Attendance/attendance.module';
import { CacheModule } from './Modules/Cache/cache.module';
import DownloadKeysModule from './Modules/Download-Keys/download-keys.module';
import { GratuationsModule } from './Modules/Graduations/gradtuations.module';
import { SubscriptionsModule } from './Modules/Subscriptions/subscriptions.module';
import { AthletesModule } from './Modules/Users/Atheles/athele.module';
import { validateEnvironment } from './Common/Utils/env-validation';

@Module({
  imports: [
    // ✅ 5.3/B-16 FIX: valida as variáveis de ambiente críticas uma vez,
    // no arranque — a app recusa arrancar se faltar alguma, em vez de
    // falhar de forma imprevisível a meio de um pedido (ver env-validation.ts).
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    ScheduleModule.forRoot(),

    AuthModule,
    DownloadKeysModule,
    AcademiesModule,
    AthletesModule,
    AthletePaymentsModule,
    AttendanceModule,
    GratuationsModule,
    SubscriptionsModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}