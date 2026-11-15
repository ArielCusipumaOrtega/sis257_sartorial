import { Controller, Get, Post, Body, Param, Query, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@ApiTags('Ventas')
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Registrar nueva venta (POS o E-commerce)' })
  create(@Body() createVentaDto: CreateVentaDto, @CurrentUser() usuario?: Usuario) {
    return this.ventasService.create(createVentaDto, usuario || null);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener métricas y KPIs de ventas' })
  getEstadisticas() {
    return this.ventasService.getEstadisticas();
  }

  @Get('estadisticas/mensuales')
  @ApiOperation({ summary: 'Obtener ventas agrupadas por mes mediante DATE_TRUNC y SQL' })
  getEstadisticasMensuales(@Query('year') year?: string) {
    return this.ventasService.getEstadisticasMensuales(year ? +year : undefined);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ventas realizadas con filtros y paginación' })
  findAll(
    @Query('clienteId') clienteId?: string,
    @Query('estado') estado?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc',
    @Query('all') all?: string,
  ) {
    return this.ventasService.findAll({
      clienteId: clienteId ? +clienteId : undefined,
      estado,
      usuarioId: usuarioId ? +usuarioId : undefined,
      limit: limit ? +limit : undefined,
      page: page ? +page : undefined,
      search,
      sortBy,
      sortOrder,
      all: all === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de venta por ID' })
  findOne(@Param('id') id: string) {
    return this.ventasService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar venta y restituir inventario' })
  cancelar(@Param('id') id: string, @CurrentUser() usuario: Usuario) {
    return this.ventasService.cancelar(+id, usuario);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar venta (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser() usuario: Usuario) {
    return this.ventasService.remove(+id, usuario);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar venta dada de baja' })
  restore(@Param('id') id: string, @CurrentUser() usuario: Usuario) {
    return this.ventasService.restore(+id, usuario);
  }
}
