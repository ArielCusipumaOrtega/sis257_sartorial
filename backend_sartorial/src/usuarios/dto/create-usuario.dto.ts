import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Alfonso' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'De La Vega' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ example: 'alfonso@prestige.com' })
  @IsEmail()
  correo: string;

  @ApiProperty({ example: 'alfonso' })
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @ApiProperty({ example: 'secreto123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  rolId: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  estado?: boolean;
}
