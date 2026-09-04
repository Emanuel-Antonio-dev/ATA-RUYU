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
    credentials?: { sub: string; academyId: string | null; role: Role },
  ) {
    try {
      if (!date) throw new BadRequestException("Informe a data da aula.");

      const isValidDate = !isNaN(new Date(date).getTime());
      if (!isValidDate) throw new BadRequestException("Data inválida.");

      if (!credentials?.academyId) {
        throw new BadRequestException("Conta sem academia associada.");
      }

      // ✅ V-01/V-05 FIX: filtro por academia movido para a query (ver
      // repositório) — deixou de buscar a base inteira e filtrar em
      // memória com uma comparação (`sub`) que nunca era verdadeira.
      const filtered = await this.repository.resumeOfAttendances(new Date(date), credentials.academyId);
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