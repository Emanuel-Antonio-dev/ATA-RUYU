// Controllers/delete-academy.controller.ts

import {
  Controller, Delete, Param,
    Req
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { DeleteAcademyService } from '../Services/delete-academy-datas.service';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Academies')
@ApiBearerAuth("accessToken")
@Controller('academies')
class DeleteAcademyController {
  constructor(private readonly deleteService: DeleteAcademyService) {}
  @Roles(Role.ADMIN_DEV, Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover academia por ID' })
  @ApiResponse({ status: 200, description: 'Academia removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Academia não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async delete(@Param('id') id: string, @Req() req: RequestWithCredentials)
  {
    const credentials = req.credentials;
    return this.deleteService.delete(id, credentials);
  }
}

export { DeleteAcademyController };