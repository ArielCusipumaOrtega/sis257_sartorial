import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ComboItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  productoId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  cantidad: number;
}

export class CreateComboDto {
  @ApiProperty({ example: 'Outfit Gala Black Tie Completo' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Esmóquin de solapa satín + Camisa Smoking + Moño de Seda + Mancuernillas + Zapatos Oxford' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 'OUTFIT-GALA-01' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 3800.0 })
  @IsNumber()
  precioVenta: number;

  @ApiProperty({ example: 2000.0, required: false })
  @IsNumber()
  @IsOptional()
  precioCompra?: number;

  @ApiProperty({ example: 5, required: false })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: 'https://images.unsplash.com/...', required: false })
  @IsString()
  @IsOptional()
  imagen?: string;

  @ApiProperty({ type: [ComboItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboItemDto)
  items: ComboItemDto[];
}
