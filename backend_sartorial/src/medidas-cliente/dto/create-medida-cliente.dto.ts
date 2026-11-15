import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMedidaClienteDto {
  @ApiProperty({ description: 'ID del cliente al que corresponden las medidas', example: 1 })
  @IsNotEmpty({ message: 'El clienteId es requerido' })
  @IsNumber({}, { message: 'El clienteId debe ser numérico' })
  clienteId: number;

  @ApiPropertyOptional({ description: 'Circunferencia de pecho en cm', example: 104.5 })
  @IsOptional()
  @IsNumber({}, { message: 'El pecho debe ser un número' })
  pecho?: number;

  @ApiPropertyOptional({ description: 'Circunferencia de cintura en cm', example: 88.0 })
  @IsOptional()
  @IsNumber({}, { message: 'La cintura debe ser un número' })
  cintura?: number;

  @ApiPropertyOptional({ description: 'Circunferencia de cadera en cm', example: 98.0 })
  @IsOptional()
  @IsNumber({}, { message: 'La cadera debe ser un número' })
  cadera?: number;

  @ApiPropertyOptional({ description: 'Ancho de hombro a hombro en cm', example: 46.5 })
  @IsOptional()
  @IsNumber({}, { message: 'Hombro a hombro debe ser un número' })
  hombroAHombro?: number;

  @ApiPropertyOptional({ description: 'Largo de manga desde hombro a muñeca en cm', example: 64.0 })
  @IsOptional()
  @IsNumber({}, { message: 'Largo de manga debe ser un número' })
  largoManga?: number;

  @ApiPropertyOptional({ description: 'Circunferencia de cuello en cm', example: 41.0 })
  @IsOptional()
  @IsNumber({}, { message: 'El cuello debe ser un número' })
  cuello?: number;

  @ApiPropertyOptional({ description: 'Tiro de pantalón en cm', example: 27.5 })
  @IsOptional()
  @IsNumber({}, { message: 'El tiro de pantalón debe ser un número' })
  tiroPantalon?: number;

  @ApiPropertyOptional({ description: 'Largo de entrepierna en cm', example: 82.0 })
  @IsOptional()
  @IsNumber({}, { message: 'El largo de entrepierna debe ser un número' })
  largoEntrepierna?: number;

  @ApiPropertyOptional({ description: 'Ancho de basta en cm', example: 19.0 })
  @IsOptional()
  @IsNumber({}, { message: 'La basta debe ser un número' })
  bastas?: number;

  @ApiPropertyOptional({ description: 'Ajuste preferido', example: 'Tailored Fit' })
  @IsOptional()
  @IsString()
  ajustePreferido?: string;

  @ApiPropertyOptional({ description: 'Observaciones de sastrería o compostura', example: 'Caída de hombro derecho regular' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ description: 'Sastre o asesor encargado', example: 'Maestro Sastre V. Hugo' })
  @IsOptional()
  @IsString()
  sastre?: string;

  @ApiPropertyOptional({ description: 'Fecha de la toma de medidas', example: '2026-11-18' })
  @IsOptional()
  @IsString()
  fechaMedicion?: string;
}
