import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  clave: string;
}
