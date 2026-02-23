import { Role } from '../Guards/roles.enum';
import { Request } from "express"
import { Roles } from '../../../Common/Decorators/roles.decorator';

interface AuthenticationDatas
{
    type: "by_token"|"by_two_factor"
    used: boolean
    expireIn: Date | string | number
    accountId?: string
    temp_email?: string,
    temp_phone_number?: string
    created_at?: Date | string
    updated_at?: Date | string

}
interface TokenDatas
{
    token: string
    token_type: "ACCESS" | "REFRESH" | "PASSWORD_RESET"
    authenticationId: string
    created_at?: Date | string
    updated_at?: Date | string
}

interface JwtPayload
{
    sub: number,
    email: string,
    role: Role
}
interface OtpCodeDatas
{
    id_two_factor_auth?: string
    otp_code: string,
    authenticationId: string
    created_at?: Date | string
    updated_at?: Date | string
}
interface RequestWithCredentials extends Request {
  credentials?: {
    sub: string;
    role: Role
  };
}

export{AuthenticationDatas, TokenDatas, JwtPayload, OtpCodeDatas, RequestWithCredentials}