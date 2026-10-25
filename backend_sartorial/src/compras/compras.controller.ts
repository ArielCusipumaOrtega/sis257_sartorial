import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@ApiTags('Compras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nueva compra / reabastecimiento a proveedor' })
  create(@Body() createCompraDto: CreateCompraDto, @CurrentUser() usuario: Usuario) {
    return this.comprasService.create(createCompraDto, usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Listar compras realizadas' })
  findAll(@Query('conInactivos') conInactivos?: string) {
    return this.comprasService.findAll(conInactivos === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener compra con su detalle por ID' })
  findOne(@Param('id') id: string) {
    return this.comprasService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar compra (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser() usuario: Usuario) {
    return this.comprasService.remove(+id, usuario);
  }

  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar compra dada de baja' })
  restore(@Param('id') id: string, @CurrentUser() usuario: Usuario) {
    return this.comprasService.restore(+id, usuario);
  }
}
