// Services/resume-attendance.service.ts

import {
  Injectable, Inject, HttpException,
  InternalServerErrorException, BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { IAttendanceRepositories } from "../Repositories/IAttendance-repositories";
import { Role } from "src/Modules/Auth/Guards/roles.enum";

@Injectable()
class ResumeAttendanceService {
  constructor(
    @Inject(IAttendanceRepositories)
    private readonly repository: IAttendanceRepositories,
  ) {}

  async execute(
    date: string,
    credentials?: { sub: string; role: Role },
  ) {
    try {
      if (!date) throw new BadRequestException("Informe a data da aula.");

      const isValidDate = !isNaN(new Date(date).getTime());
      if (!isValidDate) throw new BadRequestException("Data inválida.");

      const result = await this.repository.resumeOfAttendances(new Date(date));
      console.log(result)
      // Filtra apenas os atletas da academia do utilizador logado
      const filtered = result.filter(
        (attendance: any) => attendance?.academyId === credentials?.sub,
      );
      if(filtered.length === 0)
      {
        throw new NotFoundException("Sem assiduidades neste dia.")
      }
      const total    = filtered.length;
      const present  = filtered.filter((a: any) => a.present).length;
      const absent   = total - present;

      return {
        success:    true,
        statusCode: 200,
        datas: {
          date,
          total,
          present,
          absent,
          attendances: filtered,
        },
      };

    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException("Ocorreu um erro interno, tente novamente.");
    }
  }
}

export { ResumeAttendanceService };