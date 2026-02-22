import { Module } from '@nestjs/common';
import { AuthModule } from './Modules/Auth/auth.module';

@Module({
  imports: [
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
