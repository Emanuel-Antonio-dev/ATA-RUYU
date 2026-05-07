import { Controller, Query, Get, Param, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags, ApiQuery } from "@nestjs/swagger";
import { Roles } from "src/Common/Decorators/roles.decorator";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { GetAllAthletePaymentsService } from "../Services/get-all-athele-payments.service";
import { RequestWithCredentials } from "src/Modules/Auth/Interfaces/interface";

@ApiTags('Athletes/payments')
@ApiBearerAuth("accessToken")
@Controller('athlete-payments')
class GetAllAthletePaymentsController {
  constructor(private readonly service: GetAllAthletePaymentsService) {}

  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Get()
  @ApiOperation({ summary: 'Listar pagamentos de atletas' })
  @ApiQuery({ name: 'page',  type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista paginada de pagamentos dos atletas' })
  @ApiResponse({ status: 401, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Academia não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async findAll(
    @Req() req: RequestWithCredentials, // ✅
    @Query('page')  page?:  string,
    @Query('limit') limit?: string,
  ) {
    const credentias = req.credentials
    return this.service.execute(
      {
        page:      page  ? Number(page)  : 1,
        limit:     limit ? Number(limit) : 20,
        academyId: credentias?.sub!
      },
      credentias
    );
  }
}

export { GetAllAthletePaymentsController };