import { Injectable, Inject, BadRequestException, ConflictException, UnauthorizedException} from "@nestjs/common";
import { IAthelePaymentsRepositories } from "../Repositories/IAthlete-repositories";
import { IAtheleRepositories } from "src/Modules/Users/Atheles/Repositories/IAthlete-repositories";
import { HttpException, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/lib/prisma.service";
import { CreatePaymentDto } from "../Dtos/create-payment.dto";
import { Role } from "src/Modules/Auth/Guards/roles.enum";

@Injectable()
class RegisterAthletePaymentsService
{
    constructor(
        @Inject(IAtheleRepositories)
        private readonly repository: IAtheleRepositories,
        @Inject(IAthelePaymentsRepositories)
        private readonly paymentsRepositories:IAthelePaymentsRepositories,
        private readonly prisma: PrismaService
    ){}
    async register(datas: CreatePaymentDto, credentials?:{sub: string, academyId: string | null, role: Role}): Promise<any>
    {
        try
        {
        const existsAthele = await this.repository.getAthleteDatas(datas.athleteId)
        if(!existsAthele)
        {
            throw new BadRequestException("Atleta não encontrado(a).")
        }
        // ✅ V-05 FIX: comparar contra `academyId` (não `sub`)
        if(existsAthele.academy.id !== credentials?.academyId)
        {
            throw new UnauthorizedException("Você não tem permissão para registrar o pagamento de um(a) atleta de outra academia")
        }
        if (!existsAthele.isActive)
        {
            throw new BadRequestException('Não é possível registar pagamentos para um(a) atleta inactivo(a).',);
        }
        // Verifica duplicado filtrando por athleteId + referenceMonth
        const duplicate = await this.prisma.athelePayment.findFirst({
            where: {
                athleteId:      datas.athleteId,
                referenceMonth: new Date(datas.referenceMonth),
            },
        });
        if (duplicate)
        {
            throw new ConflictException('Já existe um pagamento registado para este(a) atleta no mês indicado.',);
        }
        const result = await this.paymentsRepositories.registerAthelePayment({
            amount: datas.amount,
            athleteId: datas.athleteId,
            paidAt: new Date(datas.paidAt!),
            referenceMonth: new Date(datas.referenceMonth)
        })
        if(!result)
        {
            throw new InternalServerErrorException("Erro ao registrar o pagamento deste(a) atleta, tente novamente.")
        }
        return {success: true,statusCode: 201,message: "Pagamento registrado/a com sucesso.", datas: result};
        } catch (error: any)
        {
            if(error instanceof HttpException)
            {
                throw error
            }
            console.error(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }
}
export { RegisterAthletePaymentsService }