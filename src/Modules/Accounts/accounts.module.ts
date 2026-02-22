import { Module } from "@nestjs/common"
import { PrismaAccountsRepositories } from "./Repositories/Prisma/PrismaAccountsRepositories"
import { IAccountsRepositories } from "./Repositories/IAccounts-repositories"
import { RegisterAccountService } from "./Services/register-account.service"
import { PrismaService } from "src/lib/prisma.service"
import { SoftDeleteAccountService } from "./Services/soft-delete-accounts.service"

@Module({
    providers:[
        RegisterAccountService,
        PrismaAccountsRepositories,
        PrismaService,
        SoftDeleteAccountService,
        {
        provide: IAccountsRepositories,
        useClass: PrismaAccountsRepositories,
    }],
    exports:[
        RegisterAccountService, 
        PrismaAccountsRepositories, 
        PrismaService, 
        IAccountsRepositories,
        SoftDeleteAccountService
    ]
})
export class AccountModule{}