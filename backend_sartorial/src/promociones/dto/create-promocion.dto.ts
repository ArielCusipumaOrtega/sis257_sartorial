import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromocionDto {
  @ApiProperty({ example: 'Descuento Temporada de Bodas' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: '15% de descuento en trajes completos y esmóquines', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 15.0 })
  @IsNumber()
  descuento: number;

  @ApiProperty({ example: '2026-01-01T00:00:00Z' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  fechaFin: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  estado?: boolean;

  @ApiProperty({ example: [1, 2, 3], required: false })
  @IsOptional()
  productoIds?: number[];
}
