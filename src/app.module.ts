import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

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

@Module({
  imports: [
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