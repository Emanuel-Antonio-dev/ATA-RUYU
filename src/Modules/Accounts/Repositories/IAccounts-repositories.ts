import { AccountDto } from "../register-account.dto";
import { Prisma } from "generated/prisma/client";
abstract class IAccountsRepositories
{
    abstract getAccountDatas(id_account?: string, email?: string, phone_number?: string):Promise<any>
    abstract registerAccount(datas: AccountDto, tx?: Omit<Prisma.TransactionClient, "$transaction">):Promise<AccountDto | any>
    abstract softDeleteForAccount(email: string): Promise<any>
    abstract editAccountDatas(id_account: string, datas:Partial<AccountDto>):Promise<AccountDto | any>
}
export{IAccountsRepositories}