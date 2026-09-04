import { MarkAttendanceDto } from "../Dtos/mark-attendance.dto";

abstract class IAttendanceRepositories
{
    abstract markAttendance(datas: MarkAttendanceDto):Promise<any>
    abstract resumeOfAttendances(date: Date | string, academyId: string):Promise<any>

}
export {IAttendanceRepositories}