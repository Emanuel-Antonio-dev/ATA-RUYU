// Controllers/find-all-academies.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { AcademyStatus, AcademyType } from 'generated/prisma/client';
import { GetAllAcademiesService } from '../Services/get-all-academies.service';

@ApiTags('Academies')
@ApiBearerAuth("accessToken")
@Controller('academies')
class GetAllAcademiesController {
  constructor(private readonly service: GetAllAcademiesService) {}
  // ✅ V-01 FIX: `@PublicRoute()` removido — este endpoint devolvia, sem
  // qualquer autenticação, o cadastro completo de todas as academias E de
  // todos os atletas da rede (incluindo telefone de emergência, histórico
  // de pagamentos, presenças e graduações — ver AUDITORIA.md). Um `curl`
  // sem token, com `?limit=999999`, extraía a base de dados inteira.
  // Continua acessível a qualquer conta autenticada (sem @Roles) — a
  // projecção devolvida agora é mínima (ver repositório), sem dados
  // sensíveis nem a colecção de atletas.
  @Get()
  @ApiOperation({ summary: 'Listar todas as academias com paginação' })
  @ApiQuery({ name: 'status', enum: AcademyStatus,          required: false, example: AcademyStatus.ACTIVE })
  @ApiQuery({ name: 'type',   enum: ['CENTRAL', 'AFFILIATE'], required: false, example: 'AFFILIATE' })
  @ApiQuery({ name: 'page',   type: Number,                  required: false, example: 1 })
  @ApiQuery({ name: 'limit',  type: Number,                  required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista paginada de academias' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async getAll(
    @Query('status') status?: AcademyStatus,
    @Query('type')   type?:   AcademyType,
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
  ) {
    return this.service.getAll({
      status,
      type,
      page:  page  ? Number(page)  : 1,
      // ✅ V-01 FIX: tecto de 100 — antes `?limit=999999` era aceite sem
      // qualquer limite.
      limit: limit ? Math.min(Number(limit), 100) : 20,
    });
  }
}

export { GetAllAcademiesController };