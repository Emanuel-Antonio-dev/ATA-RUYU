import { GraduationStatus } from "generated/prisma/enums";
import { RegisterGraduationDto, RegisterGraduationReviewDto } from "../Dtos/create-graduation.dto";

abstract class IGraduationsRepositories
{
    abstract registerGraduationReview(datas: RegisterGraduationReviewDto):Promise<any>
    abstract registerAtheleGratuation(datas: RegisterGraduationDto):Promise<any>
    abstract getAtheleGraduationDatas(atheleId: string):Promise<any>
    abstract getPendingGraduation(athleteId: string): Promise<any>
    abstract getAllGraduations(academyId: string):Promise<any[]>
    abstract setGraduationStatus(id: string, athleteId: string, status: GraduationStatus):Promise<any>

}
export {IGraduationsRepositories}