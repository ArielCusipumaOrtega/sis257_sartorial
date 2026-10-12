import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Alejandro' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Navarro' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ example: 'alejandro@prestige.com' })
  @IsEmail()
  correo: string;

  @ApiProperty({ example: 'anavarro' })
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @ApiProperty({ example: 'secreto123' })
  @IsString()
  @MinLength(6)
  password: string;
}
