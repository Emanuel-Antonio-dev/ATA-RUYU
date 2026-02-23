import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { RegisterAcademyService } from '../Services/register-academy.service';
import { CreateAcademyRequestDto } from '../Dtos/create-academy.dto';
import { uploaderOptions} from 'src/Common/Utils/multer-config';
import { PublicRoute } from 'src/Common/Decorators/public.decorator';

@ApiTags('Academies')
@Controller('academies')
export class RegisterAcademyController {
  constructor(private readonly registerAcademyService: RegisterAcademyService) {}

  @PublicRoute()  
  @Post()
  @UseInterceptors(FileInterceptor('AcademyLogos', uploaderOptions)) // 👈 passa as opções do teu multer
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Registrar uma nova academia',
    description: 'Cria uma nova academia no sistema.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name:         { type: 'string',  example: 'Academia Dragão BJJ' },
        type:         { type: 'string',  enum: ['CENTRAL', 'AFFILIATE'], example: 'AFFILIATE' },
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
  @ApiResponse({ status: 201, description: 'Academia criada com sucesso' })
  @ApiResponse({ status: 409, description: 'Nome da academia já está em uso' })
  @ApiResponse({ status: 500, description: 'Erro interno ao criar academia' })
  async register(@Body() body: CreateAcademyRequestDto,@UploadedFile() file?: Express.Multer.File,)
  {

  const logoUrl = file
    ? `/uploads/AcademyLogos/${file.filename}`
    : body.logoUrl ?? undefined; // 👈 undefined em vez de null

  return this.registerAcademyService.register({ ...body, logoUrl });
}
}