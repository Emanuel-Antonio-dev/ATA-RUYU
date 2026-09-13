import { Controller, Post, Body, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateAthleteDto } from '../Dtos/create-athlete.dto';
import { getUploaderOptions } from 'src/Common/Utils/multer-config';
import { UploadMagicNumberInterceptor } from 'src/Common/Utils/upload-magic-number.interceptor';
import { RegisterAthletesService } from '../Services/register-athletes.service';
import { PublicRoute } from 'src/Common/Decorators/public.decorator';
import { Role } from '../../../Auth/Guards/roles.enum';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { BeltColor, BeltDegree } from 'generated/prisma/enums';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Athletes')
@ApiBearerAuth('accessToken')
@Controller('athletes')
export class RegisterAthletesController {
  constructor(private readonly registerAthleteService: RegisterAthletesService) {}

  @Roles(Role.CENTRAL, Role.AFFILIATE, Role.AFFILIATE_ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('AthletePhotos', getUploaderOptions('AthletePhotos')), UploadMagicNumberInterceptor) // 👈 passa as opções do teu multer
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Registrar um novo athlete',
    description: 'Cria um novo athlete no sistema.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName:         { type: 'string',  example: 'Emanuel Juju' },
        email:        { type: 'string',  format: 'email', example: 'academia@dragao.ao' },
        birthDate:    { type: 'string',  format: 'date', example: '1990-05-20' },
        currentBelt:  { type: 'string',  enum: Object.values(BeltColor), example:  BeltColor.WHITE},
        currentDegree: { type: 'string',  enum: Object.values(BeltDegree) ,example: BeltDegree.FIRST },
        phoneNumber: { type: 'string',  example: '+244923456789' },
        emergencyPhone: { type: 'string',  example: '+244923456789' },
        enrolledAt: { type: 'string',  format: 'date', example: '2024-01-01' },
        documentType: { type: 'string',  example: 'BI' },
        documentNumber: { type: 'string',  example: '123456789' },
        AthletePhotos:    { type: 'string',  format: 'binary' }, // 👈 nome do field igual ao fieldname
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Academia criada com sucesso' })
  @ApiResponse({ status: 409, description: 'Nome da athele já está em uso' })
  @ApiResponse({ status: 500, description: 'Erro interno ao criar athele' })
  async register(@Body() body: CreateAthleteDto,@Req() req: RequestWithCredentials,@UploadedFile() file?: Express.Multer.File)
  {

  const photoUrl = file
    ? `/uploads/AthletePhotos/${file.filename}`
    : body.photoUrl ?? undefined;
    const credentials = req.credentials

  return this.registerAthleteService.register({ ...body, photoUrl }, credentials);
}
}