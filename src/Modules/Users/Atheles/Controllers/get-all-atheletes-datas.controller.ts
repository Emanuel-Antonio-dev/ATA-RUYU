import { Controller, Query, Get} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiBearerAuth, ApiTags, ApiQuery } from "@nestjs/swagger";
import { Roles } from "src/Common/Decorators/roles.decorator";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { GetAllAthletesService } from "../Services/get-all-atheletes-datas.service";

@ApiTags('Athletes')
@ApiBearerAuth("accessToken")
@Controller('athletes')
class GetAllAthletesController {
  constructor(private readonly service: GetAllAthletesService) {}

  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Get()
  @ApiOperation({ summary: 'Listar atletas com filtros opcionais' })
  @ApiQuery({ name: 'page',          type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit',         type: Number, required: false, example: 20 })
  @ApiQuery({ name: 'academyId',     type: String, required: false, description: 'Filtrar por ID da academia' })
  @ApiQuery({ name: 'affiliateCode', type: String, required: false, description: 'Filtrar por código de afiliação' })
  @ApiResponse({ status: 200, description: 'Lista paginada de atletas' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async findAll(
    @Query('page')          page?:          string,
    @Query('limit')         limit?:         string,
    @Query('academyId')     academyId?:     string,
    @Query('affiliateCode') affiliateCode?: string,
  ) {
    return this.service.execute({
      page:          page  ? Number(page)  : 1,
      limit:         limit ? Number(limit) : 20,
      academyId:     academyId     || undefined,
      affiliateCode: affiliateCode || undefined,
    });
  }
}

export { GetAllAthletesController };