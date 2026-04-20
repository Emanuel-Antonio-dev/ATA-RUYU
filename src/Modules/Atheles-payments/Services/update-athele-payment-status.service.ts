import { Inject, Injectable, InternalServerErrorException, HttpException, NotFoundException, UnauthorizedException} from "@nestjs/common";
import { IAthelePaymentsRepositories } from "../Repositories/IAthlete-repositories";
import {UpdatePaymentDto} from "../Dtos/update-payment.dto"
import { PaymentStatus, PrismaClient } from "../../../../generated/prisma/client";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { PrismaService } from "src/lib/prisma.service";

@Injectable()
class UpdateAthelePaymentService
{
    constructor(@Inject(IAthelePaymentsRepositories)
    private readonly repository: IAthelePaymentsRepositories,
    private readonly prisma: PrismaService
){}

    async updateStatus(datas: UpdatePaymentDto, credentials?: {sub: string, role: Role})
    {
        try
        {
            const existsPayment = await this.prisma.athelePayment.findFirst({where:{id: datas.id}, include:{athlete:{include:{academy:true}}}})
            if(!existsPayment)
            {
                throw new NotFoundException("Pagamento não encontrado.")
            }
            if(credentials?.sub !== existsPayment.athlete.academyId)
            {
                throw new UnauthorizedException("Você não tem permissão para atualizar o status do pagamento de um(a) atleta de outra academia.")
            }
            if(datas.status !== PaymentStatus.PENDING)
            {
                throw new UnauthorizedException("Apenas pagamentos pendentes pode ser validados.")
            }
            const result = await this.repository.updateAthelePaymentStatus(datas)
            if(!result)
            {
                throw new InternalServerErrorException("Ocorreu um erro ao atualizar o status deste pagamento, tente novamente.")
            }
            return {success: true, statusCode: 200, message:"Pagamento atualizado com sucesso."}
        } catch (error: any)
        {
            if(error instanceof HttpException)
            {
                throw error
            }
            console.log(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }


}
export {UpdateAthelePaymentService}