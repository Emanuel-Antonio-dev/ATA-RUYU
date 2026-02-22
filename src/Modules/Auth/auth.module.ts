import { Module } from "@nestjs/common";
import { IAuthenticationRepositories } from "./Repositories/IAuthentication-repositoties";
import { PrismaAuthenticationsRepositories } from "./Repositories/Prisma/PrismaAuthenticationRepositories";
import { SignInService } from "./Services/signin.service";
import { PrismaService } from "src/lib/prisma.service";
import { SignInController } from "./Controllers/signin.controller";
import { JwtService } from "@nestjs/jwt";
import { JwtOperations } from "src/Common/Utils/AuthenticationsProcols/JwtOperations/operations";
import { InitAuthenticationsService } from "./Services/init-authentications.service";
import { RequestNewPasswordController } from "./Controllers/request-password.controller";
import { RequestNewPasswordService } from "./Services/request-new-password.service";
import { AccountModule } from "../Accounts/accounts.module";
import { IAccountsRepositories } from "../Accounts/Repositories/IAccounts-repositories";
import { PrismaAccountsRepositories } from "../Accounts/Repositories/Prisma/PrismaAccountsRepositories";
import { SendEmailService } from "../Emails/send-email.service";
import { EmailModule } from "../Emails/emails.module";
import { ResetPasswordController } from "./Controllers/reset-password.controller";
import { ResetPasswordService } from "./Services/reset-password.service";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./Guards/jwt-auth.guard";
import { RolesGuard } from "./Guards/role.guard";
import { LogoutController } from "./Controllers/logout.controller";
import { RefreshTokenController } from "./Controllers/refreshToken.controller";
import { LogoutService } from "./Services/logout.service";
import { RefreshTokenService } from "./Services/refreshToken.service";
import { RegisterTokensService } from "./Services/register-tokens.service";
import { ValidateOtpController } from "./Controllers/validate-otp-code.controller";
import { ValidateOtpCodeService } from "./Services/validate-otp-code.service";
import { SendOtpCodeService } from "./Services/send-otp.service";
import { OtpGeneratorService } from "src/Common/Utils/AuthenticationsProcols/2FA/generate-otp-code.protocol";
import { SendOtpController } from "./Controllers/send-otp-code.controller";
import { GetCurrentUserController } from "./Controllers/me.controller";
import { GetCurrenteUserService } from "./Services/get-current-user.service";

@Module({
    imports:[
        AccountModule,
        EmailModule
    ],
    controllers:[
        SignInController,
        RequestNewPasswordController,
        ResetPasswordController,
        LogoutController,
        RefreshTokenController,
        SendOtpController,
        ValidateOtpController,
        GetCurrentUserController
    ],
    providers:[
        PrismaService,
        PrismaAuthenticationsRepositories,
        JwtOperations,
        JwtService,
        SignInService,
        InitAuthenticationsService,
        RegisterTokensService,
        SendOtpCodeService,
        RequestNewPasswordService,
        ResetPasswordService,
        ValidateOtpCodeService,
        LogoutService,
        RefreshTokenService,
        SendEmailService,
        OtpGeneratorService,
        SendOtpCodeService,
        GetCurrenteUserService,
        {
            provide: IAuthenticationRepositories,
            useClass: PrismaAuthenticationsRepositories
        },
        {
            provide: IAccountsRepositories,
            useClass: PrismaAccountsRepositories
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard
        }
    ],
    exports:[
        PrismaAuthenticationsRepositories,
        SignInService,
        PrismaService,
        InitAuthenticationsService,
        RegisterTokensService,
        SendOtpCodeService,
        RequestNewPasswordService,
        ResetPasswordService,
        ValidateOtpCodeService,
        LogoutService,
        RefreshTokenService,
        IAuthenticationRepositories,
        SendEmailService,
        OtpGeneratorService,
        GetCurrenteUserService
    ],

})
export class AuthModule{}