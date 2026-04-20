import { Module } from "@nestjs/common";
import { PrismaService } from "src/lib/prisma.service";
import { AcademiesModule } from "src/Modules/Academies/academies.module";
import { IAthelePaymentsRepositories } from "./Repositories/IAthlete-repositories";
import { IAtheleRepositories } from "../Users/Atheles/Repositories/IAthlete-repositories";
import { RegisterAthletePaymentController } from "./Controllers/register-athele-payments.controller";
import { GetAllAthletePaymentsController } from "./Controllers/get-all-atheles-payments.controller";
import { PrismaAthelePaymentsRepositories } from "./Repositories/Prisma/prisma-athlete-repositories";
import { AthletesModule } from "../Users/Atheles/athele.module";
import { RegisterAthletePaymentsService } from "./Services/register-athele-payments.service";
import { GetAllAthletePaymentsService } from "./Services/get-all-athele-payments.service";
import { GetAthletePaymentsController } from "./Controllers/get-athele-payments.controller";
import { GetAtheletePaymentsService } from "./Services/get-athele-payment-datas.service";
import { UpdateAthletePaymentStatusController } from "./Controllers/update-athele-payment-status.controller";
import { UpdateAthelePaymentService } from "./Services/update-athele-payment-status.service";

@Module({
    imports:[
        AthletesModule,
        AcademiesModule
    ],
    controllers:[
        RegisterAthletePaymentController,
        GetAllAthletePaymentsController,
        GetAthletePaymentsController,
        UpdateAthletePaymentStatusController
        
    ],
    providers:[
        RegisterAthletePaymentsService,
        GetAllAthletePaymentsService,
        GetAtheletePaymentsService,
        UpdateAthelePaymentService,
        PrismaService,
        {
            provide: IAthelePaymentsRepositories,
            useClass: PrismaAthelePaymentsRepositories
        }
    ],
    exports:[
        IAthelePaymentsRepositories
    ]
})
export class AthletePaymentsModule{}