import { Module } from "@nestjs/common";
import { RegisterAthletesController } from "./Controllers/register-athlete.controller";
import { RegisterAthletesService } from "./Services/register-athletes.service";
import { IAtheleRepositories } from "./Repositories/IAthlete-repositories";
import { PrismaAthelesRepositories } from "./Repositories/Prisma/prisma-athlete-repositories";
import { PrismaService } from "src/lib/prisma.service";
import { AcademiesModule } from "src/Modules/Academies/academies.module";

@Module({
    imports:[
        AcademiesModule
    ],
    controllers:[
        RegisterAthletesController
    ],
    providers:[
        RegisterAthletesService,
        PrismaService,
        {
            provide: IAtheleRepositories,
            useClass: PrismaAthelesRepositories
        }
    ],
    exports:[
        IAtheleRepositories
    ]
})
export class AthletesModule{}