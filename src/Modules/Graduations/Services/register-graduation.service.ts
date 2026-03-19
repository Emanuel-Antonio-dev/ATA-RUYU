import { BadRequestException, ForbiddenException, HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { RegisterGraduationDto,RegisterGraduationReviewDto,RegisterGraduationDtoRequest} from '../Dtos/create-graduation.dto';
import { IGraduationsRepositories } from "../Repositories/IGraduations-repositories";
import { IAtheleRepositories } from "src/Modules/Users/Atheles/Repositories/IAthlete-repositories";
import sanitize from "sanitize-html";
import { IAcademiesRepositories } from "src/Modules/Academies/Repositories/IAcademies-repositories";
import { PrismaService } from "src/lib/prisma.service";
import { Role } from "src/Modules/Auth/Guards/roles.enum";

@Injectable()
class RegisterGraduationService
{
    constructor(
        @Inject(IGraduationsRepositories)
        private readonly repository: IGraduationsRepositories,
        @Inject(IAtheleRepositories)
        private readonly atheleRepository: IAtheleRepositories,
        @Inject(IAcademiesRepositories)
        private readonly academyRepository: IAcademiesRepositories,
        private readonly prisma: PrismaService
    ){}
    async register(datas: RegisterGraduationDtoRequest, credentials?:{sub: string, role: Role})
    {
        try
        {
            const existsAthele = await this.atheleRepository.getAthleteDatas(datas.athleteId!)
            if(!existsAthele)
            {
                throw new NotFoundException("Atleta não encontrado(a)")
            }

            if(credentials?.sub !== existsAthele.academy.id)
            {
                throw new ForbiddenException("Você não tem permissão para graduar um atleta de outra academia")
            }
            const atheleHaveReview = await this.prisma.graduationReview.findFirst({where:{athleteId: datas.athleteId}})
            if(!atheleHaveReview)
            {
                throw new NotFoundException("Este atleta precisa de recomendações de graduação")
            }
            // 1. Se fromBelt foi enviado, tem que corresponder à faixa actual
            // if (datas.fromBelt && existsAthele.currentBelt !== datas.fromBelt)
            // {
            //     throw new BadRequestException(
            //         `A faixa de origem (${datas.fromBelt}) não corresponde à faixa actual do atleta (${existsAthele.currentBelt})`
            //     )
            // }
            // 2. Se fromDegree foi enviado, tem que corresponder ao grau actual
            // if (datas.fromDegree && existsAthele.currentDegree !== datas.fromDegree)
            // {
            //     throw new BadRequestException(`O grau de origem (${datas.fromDegree}) não corresponde ao grau actual do atleta (${existsAthele.currentDegree})`)
            // }
            // 3. Tem que haver pelo menos uma mudança (faixa ou grau)
            if (!datas.toBelt && !datas.toDegree)
            {
                throw new BadRequestException("É necessário indicar pelo menos a faixa ou o grau de destino")
            }
            // 4. Não pode regredir de faixa
            const beltOrder: Record<string, number> = {
                WHITE: 0, GREY: 1, YELLOW: 2, ORANGE: 3,
                GREEN: 4, BLUE: 5, PURPLE: 6, BROWN: 7, BLACK: 8,
            }
            if (datas.fromBelt && datas.toBelt)
                {
                    if (beltOrder[datas.toBelt] < beltOrder[datas.fromBelt])
                    {
                        throw new BadRequestException("Não é possível regredir a faixa de um(a) atleta")
                    }
                }
                // 5. Se só muda grau (mesma faixa), o grau tem que avançar
                const degreeOrder: Record<string, number> = {
                    NONE: 0, FIRST: 1, SECOND: 2, THIRD: 3, FOURTH: 4,
                }
                if (datas.fromDegree && datas.toDegree && !datas.toBelt) {
                    if (degreeOrder[datas.toDegree] <= degreeOrder[datas.fromDegree]) {
                        throw new BadRequestException("Ao manter a mesma faixa, o grau tem que avançar")
                    }
                }
                const totalClasses = await this.prisma.attendance.count({where:{athleteId: datas.athleteId}})
                const attendedClasses = await this.prisma.attendance.count({where:{athleteId: datas.athleteId, present: true}})

                // 6. Presenças assistidas não podem exceder o total
                // if (datas.attendedClasses! > datas.totalClasses!)
                // {
                //     throw new BadRequestException("As presenças assistidas não podem ser superiores ao total de aulas")
                // }
                const attendanceRate = attendedClasses / totalClasses
                if (totalClasses === 0)
                {
                    throw new BadRequestException('O atleta não possui aulas registadas no período de avaliação, esta graduação ficou condicionada.')
                }
                if (attendanceRate < 0.90)
                {
                    throw new BadRequestException(`O atleta tem apenas ${Math.round(attendanceRate * 100)}% de presença. Mínimo exigido: 90%`)
                }
                // 7. Atleta inactivo não pode ser graduado
                if (!existsAthele.isActive)
                {
                    throw new BadRequestException("Não é possível graduar um(a) atleta inactivo(a)")
                }
                    // 8. Já existe uma graduação pendente
                const pendingGraduation = await this.repository.getPendingGraduation(datas.athleteId!)
                if (pendingGraduation)
                {
                    throw new BadRequestException("Este(a) atleta já tem uma graduação pendente, aguarde a decisão do mestre.")
                }
            const result = await this.repository.registerAtheleGratuation({
                athleteId: datas.athleteId!,
                fromBelt: existsAthele.currentBelt,
                fromDegree: existsAthele.currentDegree,
                toBelt: datas.toBelt,
                toDegree: datas.toDegree,
                academyId: existsAthele.academy.id,
                attendedClasses: totalClasses,
                totalClasses: totalClasses
            })
            if(!result)
            {
                throw new InternalServerErrorException("Ocorreu um erro ao registrar esta graduação.")
            }
            return {success: true, statusCode: 201, message:"Graduação registrada com sucesso", datas: result}
        } catch (error: any)
        {
            if(error instanceof HttpException)
                {
                    throw error
                }
                console.log(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente")
        }
    }
}
export {RegisterGraduationService}