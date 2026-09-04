import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { IAuthenticationRepositories } from "../Repositories/IAuthentication-repositoties";
import * as bcrypt from 'bcrypt';
import { PrismaService } from "src/lib/prisma.service";
import { ValidateOtpDto } from "../authentications.dto";

@Injectable()
class ValidateOtpCodeService
{
    constructor(
        @Inject(IAuthenticationRepositories) private readonly repository: IAuthenticationRepositories,
        private readonly prisma: PrismaService
    ){}

    async validateOtpCode(datas: ValidateOtpDto)
    {
        try
        {
             if (!datas.otp_code) {
                throw new BadRequestException("Informe o seu código de verificação.")
            }
            if(!datas.email && !datas.phone_number)
            {
                throw new BadRequestException("Informe o seu email ou número de telefone.")
            }
            const otpRecord = await this.repository.findValidOtp({email: datas.email,phone_number: datas.phone_number});
            if (!otpRecord)
            {
                return { success: false, statusCode: 401, message: "Código inválido ou expirado." };
            }

            if (otpRecord.locked)
            {
                await this.repository.lockOtpCode(otpRecord.id_two_factor_auth);
                return { success: false, statusCode: 401, message: "Código bloqueado por excesso de tentativas." };
            }

            if (otpRecord.authentication.used) {
                return { success: false, statusCode: 401, message: "Este código já foi usado." };
            }

            if (otpRecord.authentication.expireIn < new Date()) {
                return { success: false, statusCode: 401, message: "Código expirado." };
            }

            const isValidOtp = await bcrypt.compare(datas.otp_code, otpRecord.otpCodeHash);
            if (!isValidOtp) {
                const transaction = await  this.prisma.$transaction(async (tx) => {
                    const icrementOtpAttemps = await this.repository.incrementOtpAttempts(otpRecord.id, tx);
                    if (icrementOtpAttemps.attempts >= otpRecord.max_attempts)
                    {
                        await this.repository.lockOtpCode(otpRecord.twoFactorAuth.id, tx);
                    }
                    return icrementOtpAttemps
                });
                if (transaction.attempts >= transaction.max_attempts)
                {
                    throw new UnauthorizedException("Você excedeu o número de tentativas. Peça um novo código.");
                }
                throw new UnauthorizedException("Código de verificação inválido.");
            }
            await this.prisma.$transaction(async (tx) => {
                await this.repository.editAuthenticationDatas(otpRecord.authentication.id, true, tx);
                await this.repository.invalidateActiveAuthentications({email: datas.email, phone_number: datas.phone_number}, tx)
                await this.repository.deleteOtpCodeDatas(otpRecord.id, tx);
            }, {maxWait: 30000, timeout: 45000});

            return { success: true, statusCode: 200, message: "Código validado com sucesso." };
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
export {ValidateOtpCodeService}