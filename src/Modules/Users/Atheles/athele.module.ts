import { Module } from "@nestjs/common";
import { RegisterAthletesController } from "./Controllers/register-athlete.controller";
import { RegisterAthletesService } from "./Services/register-athletes.service";
import { IAtheleRepositories } from "./Repositories/IAthlete-repositories";
import { PrismaAthelesRepositories } from "./Repositories/Prisma/prisma-athlete-repositories";
import { PrismaService } from "src/lib/prisma.service";
import { AcademiesModule } from "src/Modules/Academies/academies.module";
import { GetAthleteController } from "./Controllers/get-athelete-datas.controller";
import { DeleteAtheleteController } from "./Controllers/delete-ahelete-datas.controller";
import { DeleteAtheleteService } from "./Services/delete-athelete-datas.service";
import { EditAthleteController } from "./Controllers/edit-athelete-datas.controller";
import { EditAtheleteService } from "./Services/edit-athelete-datas.service";
import { GetAllAthletesService } from "./Services/get-all-atheletes-datas.service";
import { GetAtheleteByAffiliateCodeService } from "./Services/get-athelete-datas-by-code.service";
import { GetAtheleteByIdService } from "./Services/get-atheletes-datas-by-id.service";

@Module({
    imports:[
        AcademiesModule
    ],
    controllers:[
        RegisterAthletesController,
        GetAthleteController,
        DeleteAtheleteController,
        EditAthleteController,
    ],
    providers:[
        RegisterAthletesService,
        GetAtheleteByAffiliateCodeService,
        GetAllAthletesService,
        GetAtheleteByIdService,
        DeleteAtheleteService,
        EditAtheleteService,
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
export class AthletesModule {}