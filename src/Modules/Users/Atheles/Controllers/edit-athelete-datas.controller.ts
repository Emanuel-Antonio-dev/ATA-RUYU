// Controllers/edit-athlete.controller.ts

import {
  Controller, Patch, Param, Body,
  UploadedFile, UseInterceptors, Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { UpdateAthleteRequestDto } from '../Dtos/update-thlete.dto';
import { getUploaderOptions } from 'src/Common/Utils/multer-config';
import { UploadMagicNumberInterceptor } from 'src/Common/Utils/upload-magic-number.interceptor';
import { EditAtheleteService } from '../Services/edit-athelete-datas.service';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';
import { BeltColor, BeltDegree } from 'generated/prisma/enums';

@ApiTags('Athletes')
@ApiBearerAuth("accessToken")
@Controller('athletes')
class EditAthleteController {
  constructor(private readonly service: EditAtheleteService) {}

  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('AthletePhotos', getUploaderOptions('AthletePhotos')), UploadMagicNumberInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar dados do atleta' })
  @ApiBody({
    schema: {
      type: 'object',
      required:[],
      properties: {
        fullName:       { type: 'string',  example: 'Paulo Sebastião Mateus' },
        email:          { type: 'string',  format: 'email', example: 'paulo@email.com' },
        birthDate:      { type: 'string',  format: 'date',  example: '1998-03-12' },
        phone:          { type: 'string',  example: '+244923456789' },
        emergencyPhone: { type: 'string',  example: '+244912345678' },
        currentBelt:    { type: 'string',  enum: Object.values(BeltColor),   example: BeltColor.BLUE },
        currentDegree:  { type: 'string',  enum: Object.values(BeltDegree),  example: BeltDegree.FIRST },
        documentType:   { type: 'string',  enum: ['BI', 'PASSPORT'],         example: 'BI' },
        documentNumber: { type: 'string',  example: '004567890LA041' },
        isActive:       { type: 'boolean', example: true },
        AthletePhotos:  { type: 'string',  format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Atleta actualizado/a com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou nenhum campo informado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar este atleta' })
  @ApiResponse({ status: 404, description: 'Atleta não encontrado/a' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async edit(
    @Param('id') id: string,
    @Body() body: UpdateAthleteRequestDto,
    @Req() req: RequestWithCredentials,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.service.edit(id, body, file, req.credentials);
  }
}

export { EditAthleteController };