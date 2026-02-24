// Controllers/delete-academy.controller.ts

import {
  Controller, Delete, Param,
    Req
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { DeleteAtheleteService } from '../Services/delete-athelete-datas.service';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Athletes')
@ApiBearerAuth("accessToken")
@Controller('athletes')
class DeleteAtheleteController {
  constructor(private readonly deleteService: DeleteAtheleteService) {}
  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover atleta por ID' })
  @ApiResponse({ status: 200, description: 'Atleta removido/a com sucesso' })
  @ApiResponse({ status: 404, description: 'Atleta não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async delete(@Param('id') id: string, @Req() req: RequestWithCredentials)
  {
    const credentials = req.credentials;
    return this.deleteService.delete(id, credentials);
  }
}

export { DeleteAtheleteController };