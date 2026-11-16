import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AsesorEstiloService, RespuestaAsesorEstilo } from './asesor-estilo.service';
import { ConsultarEstiloDto } from './dto/consultar-estilo.dto';

@ApiTags('Asesor de Estilo')
@Controller('asesor-estilo')
export class AsesorEstiloController {
  constructor(private readonly asesorEstiloService: AsesorEstiloService) {}

  @Post('recomendar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consultar al Asesor de Estilo con IA (GenAI / Gemini)',
    description: 'Analiza el protocolo y contexto del evento del cliente para sugerir un outfit armonioso con prendas reales del inventario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recomendación generada exitosamente con prendas y análisis protocolar.',
  })
  async recomendar(@Body() dto: ConsultarEstiloDto): Promise<RespuestaAsesorEstilo> {
    return this.asesorEstiloService.consultar(dto);
  }
}
