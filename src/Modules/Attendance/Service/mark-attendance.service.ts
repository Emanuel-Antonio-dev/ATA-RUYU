import { Injectable, Inject, HttpException, BadRequestException, NotFoundException, InternalServerErrorException, UnauthorizedException, ConflictException} from "@nestjs/common";
import { IAttendanceRepositories } from "../Repositories/IAttendance-repositories";
import { MarkAttendanceDto } from '../Dtos/mark-attendance.dto';
import { IAtheleRepositories } from "src/Modules/Users/Atheles/Repositories/IAthlete-repositories";
import { IAcademiesRepositories } from "src/Modules/Academies/Repositories/IAcademies-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { PrismaService } from "src/lib/prisma.service";

@Injectable()
class MarkAttendanceService
{
    constructor(
        @Inject(IAttendanceRepositories)
        private readonly repository: IAttendanceRepositories,
        @Inject(IAtheleRepositories)
        private readonly atheleRepository: IAtheleRepositories,
        @Inject(IAcademiesRepositories)
        private readonly academyRepository: IAcademiesRepositories,
        private readonly prisma: PrismaService
    ){}

    async markAttendance(datas: MarkAttendanceDto, credentials?: {sub: string, role: Role})
    {
        try
        {
            const existsAcademy = await this.academyRepository.findAcademyById({action:"OnlyBasicsDatas"}, datas.academyId)
            if(!existsAcademy)
            {
                throw new NotFoundException("Academia não encontrada.")
            }
            const existsAthele = await this.atheleRepository.getAthleteDatas(datas.athleteId)
            if(!existsAthele)
            {
                throw new NotFoundException("Atleta não encontrado(a).")
            }
            const alreadyPresent = await this.prisma.attendance.findFirst({where:{athleteId: datas.athleteId, present: true, classDate: new Date(datas.classDate)}})
            if(alreadyPresent)
            {
                throw new ConflictException(`O(A) atleta ${existsAthele.fullName} atleta já foi marcado(a) como ${alreadyPresent.present ? "presente":"ausente"} neste dia.`)
            }
            if(credentials?.sub !== datas.academyId)
            {
                throw new UnauthorizedException("Você não tem permissão para marcar a presença de um atleta de outra academia")
            }
            const markAttendance = await this.repository.markAttendance({
                academyId: datas.academyId,
                athleteId: datas.athleteId,
                classDate: new Date(datas.classDate),
                present: datas.present,
            })
            if(!markAttendance)
            {
                throw new InternalServerErrorException("Ocorreu um erro ao marcar a presença.")
            }
            const conditional = datas.present ? "presente" : "ausente"
            return {success: true, statusCode: 201, message:`Atleta ${existsAthele.fullName} marcado(a) como ${conditional}`}
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
export{MarkAttendanceService}