import { PrismaClient, Prisma, TokenTypes } from "generated/prisma/client";
import { AutehticationsDto } from "../authentications.dto";
import { TokenDatas, AuthenticationDatas, OtpCodeDatas} from "../Interfaces/interface";

abstract class IAuthenticationRepositories
{
    abstract signIn(datas: AutehticationsDto, tx?: Omit<Prisma.TransactionClient, "$transaction">):Promise<any>
    
    abstract initAuthentication(datas: AuthenticationDatas, tx: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
    abstract getAuthenticationDatas(id_authentication: string): Promise<any>
    abstract editAuthenticationDatas(id_authentication: string, used: boolean, tx: Omit<Prisma.TransactionClient, "$transaction">):Promise<any>

    abstract registerToken(datas: TokenDatas, tx: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
    abstract getTokenDatas(token: string, type_token: TokenTypes): Promise<any>
    abstract deleteTokenDatas(token: string):Promise<any>
    //abstract editTokenDatas(token: string, isUsed: boolean):Promise<any>
    
    abstract registerOtpCode(datas: OtpCodeDatas, tx?: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>
    abstract getOtpCodeDatas(id_authentication_fk: string):Promise<any>
    abstract lockOtpCode(id_two_factor_auth: string, tx?: Omit<Prisma.TransactionClient, "$transaction">):Promise<any>

    abstract deleteOtpCodeDatas(id_two_factor_auth: string, tx: Omit<Prisma.TransactionClient, "$transaction">):Promise<any>
    abstract invalidateActiveAuthentications(params: { email?: string; phone_number?: string },tx?: Omit<Prisma.TransactionClient, "$transaction">):Promise<any>
    abstract findValidOtp(params: { email?: string; phone_number?: string }):Promise<any>
    abstract incrementOtpAttempts(id_two_factor_auth: string, tx: Omit<Prisma.TransactionClient, "$transaction">): Promise<any>

    abstract getAcademy(id: string):Promise<any>
}
export{IAuthenticationRepositories}