import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CreateAthleteDto } from '../Dtos/create-athlete.dto';
import { uploaderOptions} from 'src/Common/Utils/multer-config';
import { RegisterAthletesService } from '../Services/register-athletes.service';
import { PublicRoute } from 'src/Common/Decorators/public.decorator';

@ApiTags('Athletes')
@Controller('athletes')
export class RegisterAthletesController {
  constructor(private readonly registerAthleteService: RegisterAthletesService) {}

  @PublicRoute()
  @Post()
  @UseInterceptors(FileInterceptor('AthletePhotos', uploaderOptions)) // 👈 passa as opções do teu multer
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
        currentBelt:  { type: 'string',  example: 'PURPLE' },
        currentDegree: { type: 'string',  example: 'FIRST' },
        academyId:     {type: 'string',  example: '123e4567-e89b-12d3-a456-426614174000' },
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
  async register(@Body() body: CreateAthleteDto,@UploadedFile() file?: Express.Multer.File,)
  {

  const photoUrl = file
    ? `/uploads/AthletePhotos/${file.filename}`
    : body.photoUrl ?? undefined;

  return this.registerAthleteService.register({ ...body, photoUrl });
}
}