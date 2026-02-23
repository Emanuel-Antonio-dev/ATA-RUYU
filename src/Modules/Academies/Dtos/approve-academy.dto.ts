import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApproveAcademyDto {
  @ApiProperty({
    example: true,
    description: 'true = aprovar, false = rejeitar',
  })
  @IsBoolean()
  @IsNotEmpty({message:"Informe o status."})
  approved!: boolean;

  @ApiPropertyOptional({
    example: 'Documentação incompleta. Por favor, submeta o NIF válido.',
    description: 'Motivo de rejeição (obrigatório se approved = false)',
  })
  @IsOptional()
  @IsString()
  rejectedReason?: string;
}
