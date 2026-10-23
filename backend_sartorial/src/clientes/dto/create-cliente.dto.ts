import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty({ example: 'Sebastián' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Montenegro' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ example: '4928172', required: false })
  @IsString()
  @IsOptional()
  ciNit?: string;

  @ApiProperty({ example: '77123456', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: 'sebastian@ejemplo.com', required: false })
  @IsString()
  @IsOptional()
  correo?: string;

  @ApiProperty({ example: 'Av. Las Palmas #450', required: false })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiProperty({ example: '42R / L', required: false })
  @IsString()
  @IsOptional()
  preferenciaTalla?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  estado?: boolean;
}
