import { Module } from '@nestjs/common';
import { AuthModule } from './Modules/Auth/auth.module';
import { AcademiesModule } from './Modules/Academies/academies.module';
import { AthletesModule } from './Modules/Users/Atheles/athele.module';

@Module({
  imports: [
    AuthModule,
    AcademiesModule,
    AthletesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
