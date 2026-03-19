import { Module } from "@nestjs/common";
import { AcademiesModule } from "../Academies/academies.module";
import { DownloadKeysController } from "./Controllers/create-download-keys.controller";
import { CreateDownloadKeyService } from "./Service/create-download-keys.service";
import { GetDownloadKeyService } from "./Service/get-download-key.service";
import { DeleteDownloadKeyService } from "./Service/delete-download-keys.service";
import { ValidateDownloadKeyService } from "./Service/validate-download-keys.service";
import { PrismaDownloadKeysRepositories } from "./Repositories/Prisma/prisma-downloads-key-repositories";
import { IDownloadKeysRepositories } from "./Repositories/IDownload-keys-repositories";
import { PrismaService } from "src/lib/prisma.service";


@Module({
    imports:[AcademiesModule],
    controllers:[
        DownloadKeysController
    ],
    providers:[
        CreateDownloadKeyService,
        GetDownloadKeyService,
        DeleteDownloadKeyService,
        ValidateDownloadKeyService,
        PrismaService,
        {
            provide: IDownloadKeysRepositories,
            useClass: PrismaDownloadKeysRepositories
        }
    ],
    exports:[
        ValidateDownloadKeyService,
        IDownloadKeysRepositories
    ]
})
export default class DownloadKeysModule{}