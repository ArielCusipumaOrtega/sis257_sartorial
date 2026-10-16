import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProveedorDto {
  @ApiProperty({ example: 'Sartoria Milano SpA' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: '1029384756', required: false })
  @IsString()
  @IsOptional()
  nit?: string;

  @ApiProperty({ example: '+39 02 1234567', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: 'contacto@sartoriamilano.it', required: false })
  @IsString()
  @IsOptional()
  correo?: string;

  @ApiProperty({ example: 'Via Monte Napoleone 8, Milán', required: false })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  estado?: boolean;
}
