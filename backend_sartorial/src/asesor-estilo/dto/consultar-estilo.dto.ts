import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConsultarEstiloDto {
  @ApiProperty({
    example: 'Tengo una boda de gala en jardín a las 18:00, clima templado, código cóctel formal',
    description: 'Descripción de la ocasión, horario, lugar o requerimientos del cliente',
  })
  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @ApiProperty({
    example: 1,
    description: 'ID opcional del cliente autenticado para consultar sus medidas anatómicas',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  clienteId?: number;
}
