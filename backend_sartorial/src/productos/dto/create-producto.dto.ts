import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ example: 'Traje Dos Piezas Lana Super 130s Slim Fit' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Confeccionado en paño italiano de lana virgen Super 130s, forro en cupro transpirable y solapa de muesca.', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 'TRJ-ZEG-001' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 1200.0 })
  @IsNumber()
  precioCompra: number;

  @ApiProperty({ example: 2450.0 })
  @IsNumber()
  precioVenta: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  stock: number;

  @ApiProperty({ example: 3, required: false })
  @IsNumber()
  @IsOptional()
  stockMinimo?: number;

  @ApiProperty({ example: 'https://images.unsplash.com/...', required: false })
  @IsString()
  @IsOptional()
  imagen?: string;

  // Atributos de sastrería boutique
  @ApiProperty({ example: '40R', required: false })
  @IsString()
  @IsOptional()
  talla?: string;

  @ApiProperty({ example: 'Azul Marino Imperial', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: 'Lana Super 130s', required: false })
  @IsString()
  @IsOptional()
  material?: string;

  @ApiProperty({ example: 'Slim Fit', required: false })
  @IsString()
  @IsOptional()
  corte?: string;

  @ApiProperty({ example: 'Caballeros', required: false })
  @IsString()
  @IsOptional()
  genero?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  esCombo?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  categoriaId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  marcaId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  proveedorId?: number;

  @ApiProperty({ example: null, required: false })
  @IsNumber()
  @IsOptional()
  promocionId?: number;
}
