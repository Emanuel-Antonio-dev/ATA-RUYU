// Controllers/get-athlete.controller.ts
import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';
import { GetAtheleteByAffiliateCodeService } from '../Services/get-athelete-datas-by-code.service';
import { GetAtheleteByIdService } from '../Services/get-atheletes-datas-by-id.service';
import { GetAllAthletesService } from '../Services/get-all-atheletes-datas.service';

@ApiTags('Athletes')
@ApiBearerAuth("accessToken")
@Controller('athletes')
class GetAthleteController {
  constructor(
    private readonly getByIdService: GetAtheleteByIdService,
    private readonly getByCodeService: GetAtheleteByAffiliateCodeService,
    private readonly getAllService: GetAllAthletesService,
  ) {}

  // ✅ Rota estática SEMPRE antes das dinâmicas
  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Get()
  @ApiOperation({ summary: 'Listar atletas com filtros opcionais' })
  @ApiQuery({ name: 'page',          type: Number, required: false })
  @ApiQuery({ name: 'limit',         type: Number, required: false })
  @ApiQuery({ name: 'academyId',     type: String, required: false })
  @ApiQuery({ name: 'affiliateCode', type: String, required: false })
  @ApiResponse({ status: 200, description: 'Lista paginada de atletas' })
  async findAll(
    @Query('page')          page?:          string,
    @Query('limit')         limit?:         string,
    @Query('academyId')     academyId?:     string,
    @Query('affiliateCode') affiliateCode?: string,
  ) {
    return this.getAllService.execute({
      page:          page  ? Number(page)  : 1,
      limit:         limit ? Number(limit) : 20,
      academyId:     academyId     || undefined,
      affiliateCode: affiliateCode || undefined,
    });
  }

  // ✅ Rota por código de afiliação com prefixo claro
  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Get('/:code/affiliate-code')
  @ApiOperation({ summary: 'Buscar atleta por código de afiliação' })
  @ApiResponse({ status: 200, description: 'Atleta encontrado' })
  @ApiResponse({ status: 404, description: 'Atleta não encontrado' })
  async getByCode(@Param('code') code: string, @Req() req: RequestWithCredentials) {
    return this.getByCodeService.get(code, req.credentials);
  }

  // ✅ Rota dinâmica por ID SEMPRE por último
  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar atleta por ID' })
  @ApiResponse({ status: 200, description: 'Atleta encontrado' })
  @ApiResponse({ status: 404, description: 'Atleta não encontrado' })
  async getById(@Param('id') id: string, @Req() req: RequestWithCredentials) {
    return this.getByIdService.get(id, req.credentials);
  }
}

export { GetAthleteController };