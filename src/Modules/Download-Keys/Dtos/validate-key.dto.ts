import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsIP } from 'class-validator';

export class ValidateKeyDto {
  @ApiProperty({
    example: 'A1B2-C3D4-E5F6-G7H8',
    description: 'Chave de activação no formato XXXX-XXXX-XXXX-XXXX',
    pattern: '^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^ATA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, {
    message: 'Chave inválida. Formato esperado: ATA-XXXX-XXXX-XXXX',
  })
  key!: string;

  @ApiProperty({
    example: '192.168.25.10',
    description: 'Ip de proveniência',
  })
  @IsString({message:"O Ip deve ser uma string"})
  @IsNotEmpty({message:"Informe o Ip de proveniência."})
  @IsIP('4', { message: 'IP inválido. Formato esperado: 192.168.0.1' })
  usedByIp!: string;

  expiresAt!: Date

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID da academia',
  })
  @IsNotEmpty({message:"Informe a academia"})
  academyId!: string;

}
export class CreateDownloadKeyDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID da academia',
  })
  @IsString({ message: 'O ID da academia deve ser uma string' })
  @IsNotEmpty({ message: 'Informe o ID da academia' })
  academyId!: string;
}