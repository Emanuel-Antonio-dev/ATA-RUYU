import { Module } from '@nestjs/common';
import { AcademiesModule } from '../Academies/academies.module';
import { AthletesModule } from '../Users/Atheles/athele.module';
import { RegisterGraduationController } from './Controllers/register-graduation.controller';
import { RegisterGraduationReviewController } from './Controllers/register-graduation-review.controller';
import { RegisterGraduationReviewService } from './Services/register-graduation-review.service';
import { RegisterGraduationService } from './Services/register-graduation.service';
import { IGraduationsRepositories } from './Repositories/IGraduations-repositories';
import { PrismaGraduationRepositories } from './Repositories/Prisma/prisma-graduaions-repositories';
import { PrismaService } from 'src/lib/prisma.service';
import { GetAllGraduationsController } from './Controllers/get-all-graduations.controller';
import { GetAllGraduationsService } from './Services/get-all-graduations.service';
import { SetGraduationStatusService } from './Services/set-graduation-status.service';
import { SetGraduationStatusController } from './Controllers/set-graduation-status.controller';

@Module({
  imports: [
    AcademiesModule,
    AthletesModule,
  ],
  controllers: [
    RegisterGraduationController,
    RegisterGraduationReviewController,
    GetAllGraduationsController,
    SetGraduationStatusController,
  ],
  providers: [
    PrismaService,
    RegisterGraduationReviewService,
    RegisterGraduationService,
    GetAllGraduationsService,
    SetGraduationStatusService,
    {
        provide: IGraduationsRepositories,
        useClass: PrismaGraduationRepositories
    }
  ],
  exports:[
    IGraduationsRepositories
  ]
})
export class GratuationsModule {}
