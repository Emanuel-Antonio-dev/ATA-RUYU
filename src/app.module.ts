import { Module } from '@nestjs/common';
import { AuthModule } from './Modules/Auth/auth.module';
import { AcademiesModule } from './Modules/Academies/academies.module';
import { AthletesModule } from './Modules/Users/Atheles/athele.module';
import { AppController } from './app.controller';
import { AttendanceModule } from './Modules/Attendance/attendance.module';
import { GratuationsModule } from './Modules/Graduations/gradtuations.module';

@Module({
  imports: [
    AuthModule,
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
