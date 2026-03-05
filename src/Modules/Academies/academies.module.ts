import { Module } from '@nestjs/common';
import { RegisterAcademyController } from './Controllers/register-academies.controller';
import { RegisterAcademyService } from './Services/register-academy.service';
import { IAcademiesRepositories } from './Repositories/IAcademies-repositories';
import { PrismaAcademiesRepositories } from './Repositories/Prisma/prisma-academies-repositories';
import { PrismaService } from 'src/lib/prisma.service';
import { RegisterAccountService } from 'src/Modules/Accounts/Services/register-account.service';
import { AccountModule } from 'src/Modules/Accounts/accounts.module';
import { GetAcademyController } from './Controllers/get-academy-datas.controller';
import { GetAcademyService } from './Services/get-academy-datas.service';
import { DeleteAcademyService } from './Services/delete-academy-datas.service';
import { DeleteAcademyController } from './Controllers/delete-academy-datas.controller';
import { GetAllAcademiesController } from './Controllers/get-all-academies.controller';
import { GetAllAcademiesService } from './Services/get-all-academies.service';
import { EditAcademyController } from './Controllers/edit-academy-datas.controller';
import { EditAcademyService } from './Services/edit-academy-datas.service';
import { SetAcademyStatusController } from './Controllers/set-academy-status.controller';
import { SetAcademyService } from './Services/set-academy-status.service';
import { GetAcademiesReportsService } from './Services/get-academies-reports.service';
import {AcademiesReportsController} from './Controllers/get-academies-reports.controller'

@Module({
  imports: [
    AccountModule
  ],
  controllers: [
    RegisterAcademyController,
    GetAcademyController,
    AcademiesReportsController,
    GetAllAcademiesController,
    DeleteAcademyController,
    EditAcademyController,
    SetAcademyStatusController
],
  providers: [
    RegisterAcademyService,
    PrismaAcademiesRepositories,
    PrismaService,
    RegisterAccountService,
    GetAcademyService,
    GetAllAcademiesService,
    DeleteAcademyService,
    EditAcademyService,
    SetAcademyService,
    GetAcademiesReportsService,
    {
      provide: IAcademiesRepositories,
      useClass: PrismaAcademiesRepositories
    }
  ],
  exports:[
    IAcademiesRepositories,
    GetAcademyService
  ]
})
export class AcademiesModule {}
