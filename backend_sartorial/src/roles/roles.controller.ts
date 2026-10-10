import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo rol' })
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolesService.create(createRolDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los roles' })
  findAll(@Query('conInactivos') conInactivos?: string) {
    return this.rolesService.findAll(conInactivos === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar rol' })
  update(@Param('id') id: string, @Body() updateRolDto: UpdateRolDto) {
    return this.rolesService.update(+id, updateRolDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar rol (soft delete)' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }

  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar rol dado de baja' })
  restore(@Param('id') id: string) {
    return this.rolesService.restore(+id);
  }
}
