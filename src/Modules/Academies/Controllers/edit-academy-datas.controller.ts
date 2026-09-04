// Controllers/update-academy.controller.ts

import {
  Controller, Patch, Param, Body, Req,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { UpdateAcademyRequestDto } from '../Dtos/update-academy.dto';
import { getUploaderOptions } from 'src/Common/Utils/multer-config';
import { EditAcademyService } from '../Services/edit-academy-datas.service';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Academies')
@ApiBearerAuth("accessToken")
@Controller('academies')
class EditAcademyController {
  constructor(private readonly service: EditAcademyService) {}

  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('AcademyLogos', getUploaderOptions('AcademyLogos')))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar dados da academia' })
  @ApiBody({
    schema: {
      type: 'object',
      required: [],
      properties: {
        name:         { type: 'string',  example: 'Academia Dragão BJJ'},
        email:        { type: 'string',  format: 'email', example: 'academia@dragao.ao' },
        phone_number: { type: 'string',  example: '+244923456789' },
        address:      { type: 'string',  example: 'Rua da Missão, nº 45' },
        province:     { type: 'string',  example: 'Luanda' },
        city:         { type: 'string',  example: 'Talatona' },
        password:     { type: 'string',  example: 'senha123' },
        AcademyLogos: { type: 'string',  format: 'binary' }, // 👈 nome do field igual ao fieldname
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Academia actualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'ID não informado' })
  @ApiResponse({ status: 404, description: 'Academia não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateAcademyRequestDto,
    @UploadedFile() file?: Express.Multer.File,
    @Req() req?: RequestWithCredentials
  ) {
    const credentials = req?.credentials;
    return this.service.edit(id, body, file, credentials);
  }
}

export { EditAcademyController };