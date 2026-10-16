import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Trajes de Etiqueta' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Trajes completos de dos y tres piezas, esmóquines y trajes de gala' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 'https://images.unsplash.com/...', required: false })
  @IsString()
  @IsOptional()
  imagen?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  estado?: boolean;
}
