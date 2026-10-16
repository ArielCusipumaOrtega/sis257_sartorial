import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMarcaDto {
  @ApiProperty({ example: 'Ermenegildo Zegna' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Italia', required: false })
  @IsString()
  @IsOptional()
  paisOrigen?: string;

  @ApiProperty({ example: 'Casa de alta costura y sastrería de lujo italiana', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  estado?: boolean;
}
