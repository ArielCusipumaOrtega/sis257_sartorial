import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromocionesService } from './promociones.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Promociones')
@Controller('promociones')
export class PromocionesController {
  constructor(private readonly promocionesService: PromocionesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Crear nueva promoción o descuento' })
  create(@Body() createPromocionDto: CreatePromocionDto) {
    return this.promocionesService.create(createPromocionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las promociones vigentes' })
  findAll(@Query('conInactivos') conInactivos?: string) {
    return this.promocionesService.findAll(conInactivos === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener promoción por ID' })
  findOne(@Param('id') id: string) {
    return this.promocionesService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar promoción' })
  update(@Param('id') id: string, @Body() updatePromocionDto: UpdatePromocionDto) {
    return this.promocionesService.update(+id, updatePromocionDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar promoción (soft delete)' })
  remove(@Param('id') id: string) {
    return this.promocionesService.remove(+id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar promoción dada de baja' })
  restore(@Param('id') id: string) {
    return this.promocionesService.restore(+id);
  }
}
