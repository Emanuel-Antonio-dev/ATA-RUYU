import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";
import { OtpGeneratorService } from "src/Common/Utils/AuthenticationsProcols/2FA/generate-otp-code.protocol";
import { PrismaService } from "src/lib/prisma.service";
import { InitAuthenticationsService } from "./init-authentications.service";
import { SendEmailService } from "src/Modules/Emails/send-email.service";
import { renderOtpCodeEmail } from "src/Modules/Emails/Templates/otp-code.template";

@Injectable()
class SendOtpCodeService
{
    constructor(
        @Inject(IAuthenticationRepositories) 
        private readonly repository: IAuthenticationRepositories,
        private readonly otpCode: OtpGeneratorService,
        private readonly prisma: PrismaService,
        private readonly initAuthentication: InitAuthenticationsService,
        private readonly emailSender: SendEmailService
    ){}

    async sendOtpCode(email?: string, phone_number?: string)
    {
        try
        {
            if(!email && !phone_number)
            {
                throw new BadRequestException("Informe o seu email ou o seu número de telefone.")
            }
            const getOtp = await this.otpCode.generate(6, 15)
            const transaction = await this.prisma.$transaction(async(tx)=>{
                await this.repository.invalidateActiveAuthentications({ email, phone_number },tx);
                const authentication = await this.initAuthentication.initAuthentication({
                    type: "by_two_factor",
                    used:false,
                    expireIn: new Date(Date.now() +  15 * 60 * 1000),
                    temp_email: email,
                    temp_phone_number: phone_number
                }, tx)
                const result = await this.repository.registerOtpCode({
                    authenticationId: authentication.id,
                    otp_code: getOtp.otpCodeHash,
                }, tx)
                if(!result)
                {
                    throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
                }
                return {success: true, statusCode: 200, datas:{otp_code: getOtp.otpCode}}
            },{maxWait: 30000, timeout: 45000})
            if(email)
            {
                await this.emailSender.sendEmail(email, "Verificação em duas etapas — ATA-RYU", renderOtpCodeEmail(transaction.datas?.otp_code as string))
                return {status: transaction.success, statusCode: transaction.statusCode, message: `Acabamos de enviar um código de verificação para ${email}`, 
                    ...(process.env.NODE_ENV === "test" ? { otp_code: transaction.datas?.otp_code } : {})}
            }
            return {status: transaction.success, statusCode: transaction.statusCode, message: `Acabamos de enviar um código de verificação para ${phone_number}`}
        } catch (error: any)
        {
            if (error instanceof HttpException)
                {
                    throw error
                }  
            console.error(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }
}
export {SendOtpCodeService}