import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveriesService } from './deliveries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Deliveries & Envíos de Prendas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los envíos y entregas' })
  findAll() {
    return this.deliveriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de envío por ID' })
  findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(+id);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado de entrega (Pendiente, En Preparacion, En Camino, Entregado, Cancelado)' })
  updateEstado(@Param('id') id: string, @Body('estado') estado: string) {
    return this.deliveriesService.updateEstado(+id, estado);
  }
}
