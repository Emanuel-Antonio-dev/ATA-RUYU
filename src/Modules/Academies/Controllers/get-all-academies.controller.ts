// Controllers/find-all-academies.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiQuery,
} from '@nestjs/swagger';
import { AcademyStatus, AcademyType } from 'generated/prisma/client';
import { GetAllAcademiesService } from '../Services/get-all-academies.service';
import { PublicRoute } from 'src/Common/Decorators/public.decorator';

@ApiTags('Academies')
@Controller('academies')
class GetAllAcademiesController {
  constructor(private readonly service: GetAllAcademiesService) {}
  @PublicRoute()
  @Get()
  @ApiOperation({ summary: 'Listar todas as academias com paginação' })
  @ApiQuery({ name: 'status', enum: AcademyStatus,          required: false, example: AcademyStatus.ACTIVE })
  @ApiQuery({ name: 'type',   enum: ['CENTRAL', 'AFFILIATE'], required: false, example: 'AFFILIATE' })
  @ApiQuery({ name: 'page',   type: Number,                  required: false, example: 1 })
  @ApiQuery({ name: 'limit',  type: Number,                  required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista paginada de academias' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async findAll(
    @Query('status') status?: AcademyStatus,
    @Query('type')   type?:   AcademyType,
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
  ) {
    return this.service.execute({
      status,
      type,
      page:  page  ? Number(page)  : 1,
      limit: limit ? Number(limit) : 20,
    });
  }
}

export { GetAllAcademiesController };