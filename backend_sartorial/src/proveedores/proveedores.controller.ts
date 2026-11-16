import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Proveedores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo proveedor de confección / telas' })
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedoresService.create(createProveedorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar proveedores con paginación y filtros' })
  findAll(
    @Query('conInactivos') conInactivos?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc',
    @Query('all') all?: string,
  ) {
    return this.proveedoresService.findAll({
      conInactivos: conInactivos === 'true',
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
      sortBy,
      sortOrder,
      all: all === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar proveedor' })
  update(@Param('id') id: string, @Body() updateProveedorDto: UpdateProveedorDto) {
    return this.proveedoresService.update(+id, updateProveedorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar proveedor (soft delete)' })
  remove(@Param('id') id: string) {
    return this.proveedoresService.remove(+id);
  }

  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar proveedor dado de baja' })
  restore(@Param('id') id: string) {
    return this.proveedoresService.restore(+id);
  }
}
