import { Injectable, Inject, BadRequestException} from "@nestjs/common";
import { IAtheleRepositories } from "../Repositories/IAthlete-repositories";
import sanitize from "sanitize-html";
import { CreateAthleteDto } from "../Dtos/create-athlete.dto";
import { HttpException, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/lib/prisma.service";
import { IAcademiesRepositories } from "src/Modules/Academies/Repositories/IAcademies-repositories";
import { generateAffiliateNumber } from "src/Common/Utils/generate-codes";

@Injectable()
class RegisterAthletesService
{
    constructor(
        @Inject(IAtheleRepositories)
        private readonly repository: IAtheleRepositories,
        @Inject(IAcademiesRepositories)
        private readonly academyRepository: IAcademiesRepositories,
        private readonly prisma: PrismaService
    ){}
    async register(datas: CreateAthleteDto): Promise<any>
    {
        try
        {
            if(!datas.photoUrl)
            {
                throw new BadRequestException("É obrigatório enviar a foto do atleta.")
            }
        const sanitizedData = {
            fullName: sanitize(datas.fullName,
                {
                    allowedAttributes:{},
                    allowedTags: [],
                    allowedClasses:{}
                }
            ),
            birthDate: datas.birthDate,
            currentBelt: datas.currentBelt,
            currentDegree: datas.currentDegree,
            photoUrl: datas.photoUrl ? sanitize(datas.photoUrl,
                {
                    allowedAttributes:{},
                    allowedTags: [],
                    allowedClasses:{}
                }
            ) : undefined,
        }
        let affiliateCode: string;
        while (true)
        {
            affiliateCode = generateAffiliateNumber();
            const conflict = await this.prisma.athlete.findFirst({
                where: { affiliateCode },
            });
            if (!conflict) break;
        }
        const existsAcademy = await this.academyRepository.findAcademyById({action:"OnlyBasicsDatas"},datas.academyId, undefined)
        if(!existsAcademy)
        {
            throw new BadRequestException("A academia associada não foi encontrada.")
        }
        const existsDocumentNumber = await this.prisma.athlete.findFirst({where:{documentNumber: datas.documentNumber, documentType: datas.documentType}})
        if(existsDocumentNumber)
        {
            throw new BadRequestException("Já existe um atleta registrado com este número de documento.")
        }
        const athlete = await this.repository.registerAthlete({
            academyId: datas.academyId,
            email: datas.email,
            phoneNumber: datas.phoneNumber,
            emergencyPhone: datas.emergencyPhone,
            enrolledAt: datas.enrolledAt,
            affiliateCode,
            documentNumber: datas.documentNumber,
            documentType: datas.documentType,
            ...sanitizedData
        })
        if(!athlete)
        {
            throw new InternalServerErrorException("Erro ao registrar atleta, tente novamente.")
        }
        const datasFormatted = {
            id: athlete.id,
            fullName: athlete.fullName,
            birthDate: athlete.birthDate.toISOString().split('T')[0],
            currentBelt: athlete.currentBelt,
            currentDegree: athlete.currentDegree,
            photoUrl: athlete.photoUrl,
            affiliateCode: athlete.affiliateCode,
            academyId: athlete.academyId,
            documentNumber: athlete.documentNumber,
            documentType: athlete.documentType,
            enrolledAt: athlete.enrolledAt.toISOString().split('T')[0],
            createdAt: athlete.createdAt,
        }
        return {success: true,statusCode: 201,message: "Atleta registrado/a com sucesso.", datas: datasFormatted};
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
export { RegisterAthletesService }