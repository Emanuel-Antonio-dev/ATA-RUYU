import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Request
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateDownloadKeyService } from '../Service/create-download-keys.service';
import { ValidateDownloadKeyService } from '../Service/validate-download-keys.service';
import { GetDownloadKeyService } from '../Service/get-download-key.service';
import { DeleteDownloadKeyService } from '../Service/delete-download-keys.service';
import { CreateDownloadKeyDto, ValidateKeyDto } from '../Dtos/validate-key.dto';
import { Role } from 'src/Modules/Auth/Guards/roles.enum';
import { Roles } from 'src/Common/Decorators/roles.decorator';
import { RequestWithCredentials } from 'src/Modules/Auth/Interfaces/interface';

@ApiTags('Download Keys')
@ApiBearerAuth("accessToken")
@Controller('download-keys')

export class DownloadKeysController {
  constructor(
    private readonly createService: CreateDownloadKeyService,
    private readonly validateService: ValidateDownloadKeyService,
    private readonly getService: GetDownloadKeyService,
    private readonly deleteService: DeleteDownloadKeyService,
  ) {}

  // ─── CREATE ────────────────────────────────────────────────────────────────

  @Roles(Role.CENTRAL)
  @Post()
  @ApiOperation({
    summary: 'Gerar chave de download',
    description:
      'Gera uma nova chave de download única para a academia indicada. A chave expira em 1 hora.',
  })
  @ApiResponse({
    status: 201,
    description: 'Chave gerada com sucesso.',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Chave de download gerada com sucesso',
        datas: 'ATA-1B2-C3D4-E5F6-G7H8',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'academyId não informado.' })
  @ApiResponse({ status: 404, description: 'Academia não encontrada.' })
  @ApiResponse({ status: 409, description: 'Não foi possível gerar uma chave única.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  async create(@Body() academyId: CreateDownloadKeyDto) {
    return await this.createService.execute(academyId);
  }

  // ─── VALIDATE ──────────────────────────────────────────────────────────────

  @Roles(Role.AFFILIATE, Role.AFFILIATE_ADMIN, Role.CENTRAL)
  @Post('validate')
  @ApiOperation({
    summary: 'Validar chave de download',
    description:
      'Valida uma chave de download informada pelo cliente. Se válida, marca como utilizada e libera o download.',
  })
  @ApiBody({ type: ValidateKeyDto })
  @ApiResponse({
    status: 200,
    description: 'Chave válida. Download liberado.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Chave validada com sucesso.',
        datas: {
          id: 'clx1abc23def456',
          key: 'A1B2-C3D4-E5F6-G7H8',
          status: 'USED',
          usedByIp: '192.168.25.10',
          usedAt: '2024-01-01T12:00:00.000Z',
          academy: {
            id: 'clx1abc23def456',
            name: 'Academia Exemplo',
            logoUrl: 'https://example.com/logo.png',
            affiliateNumber: 'ATA-0001',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Chave expirada, já utilizada ou IP repetido.' })
  @ApiResponse({ status: 404, description: 'Chave não encontrada.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  async validate(@Body() {key}: ValidateKeyDto, @Request() req: RequestWithCredentials) {
    return await this.validateService.validate({
      key: key,
      usedByIp: req.ip!
    });
  }

  // ─── GET ───────────────────────────────────────────────────────────────────

  @Roles(Role.CENTRAL)
  @Get(':key')
  @ApiOperation({
    summary: 'Buscar chave de download',
    description: 'Retorna os detalhes de uma chave de download.',
  })
  @ApiParam({
    name: 'key',
    description: 'chave de download',
    example: 'ATA-2MB6-PQEX-EE56',
  })
  @ApiResponse({
    status: 200,
    description: 'Chave encontrada.',
    schema: {
      example: {
        id: 'clx1abc23def456',
        key: 'A1B2-C3D4-E5F6-G7H8',
        status: 'ACTIVE',
        expiresAt: '2024-01-01T13:00:00.000Z',
        usedByIp: '',
        usedAt: null,
        academy: {
          id: 'clx1abc23def456',
          name: 'Academia Exemplo',
          logoUrl: 'https://example.com/logo.png',
          affiliateNumber: 'ATA-0001',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Parâmetro de busca não informado.' })
  @ApiResponse({ status: 404, description: 'Chave não encontrada.' })
  getById(@Param('key') key: string) {
    return this.getService.execute({ key: key });
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────

  @Roles(Role.CENTRAL)
  @Delete(':key')
  @ApiOperation({
    summary: 'Remover chave de download',
    description: 'Remove permanentemente uma chave de download pela sua chave.',
  })
  @ApiParam({
    name: 'key',
    description: 'Chave de download a ser removida',
    example: 'ATA-2MB6-PQEX-EE56',
  })
  @ApiResponse({
    status: 200,
    description: 'Chave removida com sucesso.',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        message: 'Chave removida com sucesso.',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Chave não encontrada.' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor.' })
  async delete(@Param('key') key: string) {
    return await this.deleteService.execute({ key: key });
  }
}