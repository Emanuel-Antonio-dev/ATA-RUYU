import { BadRequestException, ForbiddenException, HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { RegisterGraduationDto, RegisterGraduationReviewDto} from '../Dtos/create-graduation.dto';
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
    async register(datas: RegisterGraduationDto, credentials?:{sub: string, role: Role})
    {
        try
        {
            const existsAthele = await this.atheleRepository.getAthleteDatas(datas.athleteId)
            if(!existsAthele)
            {
                throw new NotFoundException("Atleta não encontrado(a)")
            }
            const existsAcademy = await this.academyRepository.findAcademyById({action:"OnlyBasicsDatas"},datas.athleteId, undefined)
            if(!existsAcademy)
            {
                throw new NotFoundException("Academia não encontrada")
            }
            if(credentials?.sub !== existsAcademy.id)
            {
                throw new ForbiddenException("Você não tem permissão para graduar um atleta de outra academia")
            }
            const atheleHaveReview = await this.prisma.graduationReview.findFirst({where:{athleteId: datas.athleteId}})
            if(!atheleHaveReview)
            {
                throw new NotFoundException("Este atleta não possui nenhuma recomendação de graduação")
            }
            // 1. Se fromBelt foi enviado, tem que corresponder à faixa actual
            if (datas.fromBelt && existsAthele.currentBelt !== datas.fromBelt)
            {
                throw new BadRequestException(
                    `A faixa de origem (${datas.fromBelt}) não corresponde à faixa actual do atleta (${existsAthele.currentBelt})`
                )
            }
            // 2. Se fromDegree foi enviado, tem que corresponder ao grau actual
            if (datas.fromDegree && existsAthele.currentDegree !== datas.fromDegree)
            {
                throw new BadRequestException(`O grau de origem (${datas.fromDegree}) não corresponde ao grau actual do atleta (${existsAthele.currentDegree})`)
            }
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
                
                // 6. Presenças assistidas não podem exceder o total
                if (datas.attendedClasses > datas.totalClasses)
                {
                    throw new BadRequestException("As presenças assistidas não podem ser superiores ao total de aulas")
                }
                // 7. Atleta inactivo não pode ser graduado
                if (!existsAthele.isActive)
                    {
                        throw new BadRequestException("Não é possível graduar um(a) atleta inactivo(a)")
                    }
                    // 8. Já existe uma graduação pendente
                const pendingGraduation = await this.repository.getPendingGraduation(datas.athleteId)
                if (pendingGraduation)
                {
                    throw new BadRequestException("Este(a) atleta já tem uma graduação pendente ou em avaliação")
                }

            if(existsAthele.fromBelt === datas.fromBelt)
            {
                throw new BadRequestException("Você não pode graduar um(a) atleta para a mesma faixa")
            }
            const result = await this.repository.registerAtheleGratuation({
                athleteId: datas.athleteId,
                attendedClasses: datas.attendedClasses,
                fromBelt: datas.fromBelt,
                fromDegree: datas.fromDegree,
                toBelt: datas.toBelt,
                toDegree: datas.toDegree,
                totalClasses: datas.totalClasses,
                academyId: existsAcademy.id
            })
            if(!result)
            {
                throw new InternalServerErrorException("Ocorreu um erro ao registrar esta avaliação")
            }
            return {success: true, statusCode: 201, message:"Avaliação registrada com sucesso", datas: result}
        } catch (error: any)
        {
            if(error instanceof HttpException)
                {
                    throw error
                }
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente")
        }
    }
}
export {RegisterGraduationService}