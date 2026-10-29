import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoVenta, TipoEntrega } from '../entities/venta.entity';

export class DetalleVentaItemDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  productoId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  cantidad: number;

  @ApiProperty({ example: 2450.0 })
  @Type(() => Number)
  @IsNumber()
  precio: number;

  @ApiProperty({ example: '40R', required: false })
  @IsString()
  @IsOptional()
  talla?: string;

  @ApiProperty({ example: 'Azul Marino', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  componentes?: { productoId: number; cantidad: number }[];
}

export class PagoItemDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  metodoPagoId: number;

  @ApiProperty({ example: 2450.0 })
  @Type(() => Number)
  @IsNumber()
  monto: number;

  @ApiProperty({ example: 'TRX-948192', required: false })
  @IsString()
  @IsOptional()
  referencia?: string;
}

export class CreateVentaDto {
  @ApiProperty({ example: 1, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  clienteId?: number;

  @ApiProperty({ enum: ['Confirmada', 'Cancelada', 'Pendiente'], required: false })
  @IsEnum(['Confirmada', 'Cancelada', 'Pendiente'])
  @IsOptional()
  estado?: EstadoVenta;

  @ApiProperty({ enum: ['Tienda', 'Delivery'], required: false })
  @IsEnum(['Tienda', 'Delivery'])
  @IsOptional()
  tipoEntrega?: TipoEntrega;

  @ApiProperty({ example: 'Av. América #123, Edif. Los Álamos', required: false })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiProperty({ example: 'Frente al parque central', required: false })
  @IsString()
  @IsOptional()
  referencia?: string;

  @ApiProperty({ example: '77123456', required: false })
  @IsString()
  @IsOptional()
  telefonoContacto?: string;

  @ApiProperty({ example: 20.0, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  costoDelivery?: number;

  @ApiProperty({ example: -19.043, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  latitud?: number;

  @ApiProperty({ example: -65.259, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  longitud?: number;

  @ApiProperty({ example: 'data:image/png;base64,...', required: false })
  @IsString()
  @IsOptional()
  comprobanteQr?: string;

  @ApiProperty({ type: [DetalleVentaItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaItemDto)
  detalles: DetalleVentaItemDto[];

  @ApiProperty({ type: [PagoItemDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PagoItemDto)
  pagos?: PagoItemDto[];
}
