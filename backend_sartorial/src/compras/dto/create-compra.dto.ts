import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DetalleCompraItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  productoId: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  cantidad: number;

  @ApiProperty({ example: 1200.0 })
  @IsNumber()
  precio: number;
}

export class CreateCompraDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  proveedorId: number;

  @ApiProperty({ example: 'Abastecimiento de trajes colección otoño/invierno', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({ type: [DetalleCompraItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleCompraItemDto)
  detalles: DetalleCompraItemDto[];
}
