import { Module } from "@nestjs/common";
import { RegisterAthletesController } from "./Controllers/register-athlete.controller";
import { RegisterAthletesService } from "./Services/register-athletes.service";
import { IAtheleRepositories } from "./Repositories/IAthlete-repositories";
import { PrismaAthelesRepositories } from "./Repositories/Prisma/prisma-athlete-repositories";
import { PrismaService } from "src/lib/prisma.service";
import { AcademiesModule } from "src/Modules/Academies/academies.module";
import { GetAtheleteByAffiliateCodeController } from "./Controllers/get-athelete-datas-by-affiliate-code.controller";
import { GetAtheleteController } from "./Controllers/get-athelete-datas.controller";
import { GetAtheleteByAffiliateCodeService } from "./Services/get-athelete-datas.service";
import { GetAtheleteService } from "./Services/get-athelete-datas-by-affiliate-code.service";
import { DeleteAtheleteController } from "./Controllers/delete-ahelete-datas.controller";
import { DeleteAtheleteService } from "./Services/delete-athelete-datas.service";
import { EditAthleteController } from "./Controllers/edit-athelete-datas.controller";
import { EditAtheleteService } from "./Services/edit-athelete-datas.service";
import { GetAllAthletesController } from "./Controllers/get-all-atheletes-datas.controller";
import { GetAllAthletesService } from "./Services/get-all-atheletes-datas.service";

@Module({
    imports:[
        AcademiesModule
    ],
    controllers:[
        RegisterAthletesController,
        GetAtheleteByAffiliateCodeController,
        GetAtheleteController,
        DeleteAtheleteController,
        EditAthleteController,
        GetAllAthletesController
    ],
    providers:[
        RegisterAthletesService,
        GetAtheleteByAffiliateCodeService,
        GetAtheleteService,
        DeleteAtheleteService,
        EditAtheleteService,
        GetAllAthletesService,
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