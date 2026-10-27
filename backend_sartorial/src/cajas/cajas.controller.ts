import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CajasService } from './cajas.service';
import { AperturaCajaDto, CierreCajaDto } from './dto/caja.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@ApiTags('Cajas & Turnos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cajas')
export class CajasController {
  constructor(private readonly cajasService: CajasService) {}

  @Get('activa')
  @ApiOperation({ summary: 'Obtener la caja abierta actual del usuario autenticado' })
  getCajaActiva(@CurrentUser() usuario: Usuario) {
    return this.cajasService.getCajaActiva(usuario.id);
  }

  @Post('abrir')
  @ApiOperation({ summary: 'Abrir turno de caja' })
  abrirCaja(@Body() dto: AperturaCajaDto, @CurrentUser() usuario: Usuario) {
    return this.cajasService.abrirCaja(dto, usuario);
  }

  @Post(':id/cerrar')
  @ApiOperation({ summary: 'Cerrar y arquear turno de caja' })
  cerrarCaja(@Param('id') id: string, @Body() dto: CierreCajaDto, @CurrentUser() usuario: Usuario) {
    return this.cajasService.cerrarCaja(+id, dto, usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Listar historial de todas las cajas' })
  findAll() {
    return this.cajasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de caja por ID' })
  findOne(@Param('id') id: string) {
    return this.cajasService.findOne(+id);
  }
}
