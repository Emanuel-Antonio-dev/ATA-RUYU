import { HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException, ForbiddenException} from "@nestjs/common";
import { RegisterGraduationDto, RegisterGraduationReviewDto} from '../Dtos/create-graduation.dto';
import { PrismaGraduationRepositories } from "../Repositories/Prisma/prisma-graduaions-repositories";
import { IGraduationsRepositories } from "../Repositories/IGraduations-repositories";
import { IAtheleRepositories } from "src/Modules/Users/Atheles/Repositories/IAthlete-repositories";
import { IAcademiesRepositories } from "src/Modules/Academies/Repositories/IAcademies-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import sanitize from "sanitize-html";

@Injectable()
class RegisterGraduationReviewService
{
    constructor(
        @Inject(IGraduationsRepositories)
        private readonly repository: IGraduationsRepositories,
        @Inject(IAtheleRepositories)
        private readonly atheleRepository: IAtheleRepositories,
    ){}
    async register(datas: RegisterGraduationReviewDto, credentials?:{sub: string, academyId: string | null, role: Role})
    {
        try
        {
            const existsAthele = await this.atheleRepository.getAthleteDatas(datas.athleteId)
            if(!existsAthele)
            {
                throw new NotFoundException("Atleta não encontrado(a)")
            }
            // ✅ V-05 FIX: comparar contra `academyId` (não `sub`)
            if(credentials?.academyId !== existsAthele.academy.id)
            {
                throw new ForbiddenException("Você não tem permissão para avaliar a gradução de um(a) atleta de outra academia")
            }
            const result = await this.repository.registerGraduationReview({
                athleteId: datas.athleteId,
                comment: sanitize(datas.comment,{
                    allowedAttributes:{},
                    allowedClasses:{},
                    allowedTags:[]
                }),
                recommendation: datas.recommendation,
                behaviorScore: datas.behaviorScore,
                technicalScore: datas.technicalScore
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
export {RegisterGraduationReviewService}