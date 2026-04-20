import { Module } from '@nestjs/common';
import { AuthModule } from './Modules/Auth/auth.module';
import { AcademiesModule } from './Modules/Academies/academies.module';
import { AthletesModule } from './Modules/Users/Atheles/athele.module';
import { AppController } from './app.controller';
import { AttendanceModule } from './Modules/Attendance/attendance.module';
import { GratuationsModule } from './Modules/Graduations/gradtuations.module';
import DownloadKeysModule from './Modules/Download-Keys/download-keys.module';
import { AthletePaymentsModule } from './Modules/Atheles-payments/atheles-payments.module';
import { SubscriptionsModule } from './Modules/Subscriptions/subscriptions.module';

@Module({
  imports: [
    AuthModule,
    DownloadKeysModule,
    AcademiesModule,
    AthletesModule,
    AthletePaymentsModule,
    AttendanceModule,
    GratuationsModule,
    SubscriptionsModule
    
  ],
  controllers: [
    AppController
  ],
  providers: [],
})
export class AppModule {}
