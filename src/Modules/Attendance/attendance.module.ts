import { Module } from "@nestjs/common";
import { AcademiesModule } from "../Academies/academies.module";
import { AthletesModule } from "../Users/Atheles/athele.module";
import { MarkAttendanceController } from "./Controllers/mark-attendance.controller";
import { MarkAttendanceService } from "./Service/mark-attendance.service";
import { PrismaService } from "src/lib/prisma.service";
import { IAttendanceRepositories } from "./Repositories/IAttendance-repositories";
import { PrismaAttendanceRepositories } from "./Repositories/Prisma/prisma-attendance-repositories";
import { ResumeAttendanceController } from "./Controllers/resume-attendances.controller";
import { ResumeAttendanceService } from "./Service/resume-attendences.service";

@Module({
    imports:[
        AcademiesModule,
        AthletesModule
    ],
    controllers:[
        MarkAttendanceController,
        ResumeAttendanceController
    ],
    providers:[
        MarkAttendanceService,
        ResumeAttendanceService,
        PrismaService,
        {
            provide: IAttendanceRepositories,
            useClass: PrismaAttendanceRepositories
        }
    ],
    exports:[
        IAttendanceRepositories
    ]
})
export class AttendanceModule{}