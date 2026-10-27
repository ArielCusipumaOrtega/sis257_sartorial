import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AperturaCajaDto {
  @ApiProperty({ example: 500.0 })
  @IsNumber()
  @IsNotEmpty()
  montoApertura: number;

  @ApiProperty({ example: 'Apertura de turno mañana en boutique', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class CierreCajaDto {
  @ApiProperty({ example: 3450.0 })
  @IsNumber()
  @IsNotEmpty()
  montoCierre: number;

  @ApiProperty({ example: 'Cierre de turno sin novedades', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;
}
