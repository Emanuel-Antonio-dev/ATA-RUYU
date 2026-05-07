import { Controller, Patch, Param, Body, Req} from "@nestjs/common";
import {
    ApiTags, ApiOperation, ApiResponse,
    ApiBearerAuth, ApiParam, ApiBody,
} from "@nestjs/swagger"
import { UpdateAthelePaymentService } from "../Services/update-athele-payment-status.service";
import { Role } from "src/Modules/Auth/Guards/roles.enum";
import { Roles } from "src/Common/Decorators/roles.decorator";
import { UpdatePaymentDto } from "../Dtos/update-payment.dto";
import { RequestWithCredentials } from "src/Modules/Auth/Interfaces/interface";


@ApiTags('Athletes/payments')
@ApiBearerAuth("accessToken")
@Controller('athletes/payments')

class UpdateAthletePaymentStatusController {
  constructor(private readonly service: UpdateAthelePaymentService) {}

  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Patch(':id/status')
  @ApiParam({
      name: 'id',
      description: 'ID do pagamento a ser atualizado',
      example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
  @ApiOperation({ summary: 'Setar status do pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento actualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou nenhum campo informado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para alterar o status deste pagamento' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })

  async update(
    @Param('id') id: string,
    @Body() body: UpdatePaymentDto,
    @Req() req: RequestWithCredentials,
  )
  {
    const credentials = req.credentials
    return this.service.updateStatus(id, {...body}, credentials);
  }
}
export{UpdateAthletePaymentStatusController}