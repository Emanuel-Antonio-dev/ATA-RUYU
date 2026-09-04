import { Injectable, Inject, BadRequestException} from "@nestjs/common";
import { IAtheleRepositories } from "../Repositories/IAthlete-repositories";
import sanitize from "sanitize-html";
import { CreateAthleteDto } from "../Dtos/create-athlete.dto";
import { HttpException, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/lib/prisma.service";
import { IAcademiesRepositories } from "src/Modules/Academies/Repositories/IAcademies-repositories";
import { generateAthleteAffiliateCode } from "src/Common/Utils/generate-codes";
import { Role } from "src/Modules/Auth/Guards/roles.enum";

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
    async register(datas: CreateAthleteDto, credentials?:{sub: string, academyId: string | null, role: Role}): Promise<any>
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
        // ✅ V-05 FIX: comparar/usar `academyId` (não `sub`, que agora é
        // sempre o Account.id) — antes, o atleta era registado sob o
        // Account.id de quem fazia o pedido em vez da academia real.
        const existsAcademy = await this.academyRepository.findAcademyById({action:"OnlyBasicsDatas"},credentials?.academyId ?? undefined, undefined)
        if(!existsAcademy)
        {
            throw new BadRequestException("A academia associada não foi encontrada.")
        }
        const existsDocumentNumber = await this.prisma.athlete.findFirst({where:{documentNumber: datas.documentNumber, documentType: datas.documentType}})
        if(existsDocumentNumber)
        {
            throw new BadRequestException("Já existe um atleta registrado com este número de documento.")
        }
        // ✅ B-07 FIX: "gera → verifica → repete" (corrida — dois pedidos
        // simultâneos podiam gerar o mesmo código entre a verificação e a
        // escrita) substituído por "tenta criar → se colidir (P2002), gera
        // outro e tenta de novo", num número limitado de tentativas.
        const MAX_ATTEMPTS = 5;
        let athlete: any = null;
        let lastError: any = null;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            const affiliateCode = generateAthleteAffiliateCode();
            try {
                athlete = await this.repository.registerAthlete({
                    academyId: credentials?.academyId!,
                    email: datas.email,
                    phoneNumber: datas.phoneNumber,
                    emergencyPhone: datas.emergencyPhone,
                    enrolledAt: datas.enrolledAt,
                    affiliateCode,
                    documentNumber: datas.documentNumber,
                    documentType: datas.documentType,
                    ...sanitizedData
                })
                break;
            } catch (err: any) {
                lastError = err;
                if (err?.code === "P2002") {
                    continue; // colisão no affiliateCode — tenta outro
                }
                throw err;
            }
        }
        if(!athlete)
        {
            console.error("Falha ao gerar affiliateCode único após várias tentativas:", lastError);
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
            console.error(error)
            throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.")
        }
    }
}
export { RegisterAthletesService }