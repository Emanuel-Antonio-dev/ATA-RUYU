import { Module } from '@nestjs/common';
import { AuthModule } from './Modules/Auth/auth.module';
import { AcademiesModule } from './Modules/Academies/academies.module';
import { AthletesModule } from './Modules/Users/Atheles/athele.module';
import { AppController } from './app.controller';
import { AttendanceModule } from './Modules/Attendance/attendance.module';
import { GratuationsModule } from './Modules/Graduations/gradtuations.module';
import { DownloadKeysController } from './Modules/Download-Keys/Controllers/create-download-keys.controller';
import DownloadKeysModule from './Modules/Download-Keys/download-keys.module';

@Module({
  imports: [
    AuthModule,
    DownloadKeysModule,
    AcademiesModule,
    AthletesModule,
    AttendanceModule,
    GratuationsModule
  ],
  controllers: [
    AppController
  ],
  providers: [],
})
export class AppModule {}
