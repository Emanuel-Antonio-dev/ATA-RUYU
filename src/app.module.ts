import { Module } from '@nestjs/common';
import { AuthModule } from './Modules/Auth/auth.module';
import { AcademiesModule } from './Modules/Academies/academies.module';

@Module({
  imports: [
    AuthModule,
    AcademiesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
