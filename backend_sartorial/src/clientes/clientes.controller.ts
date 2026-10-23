import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear nuevo cliente' })
  create(@Body() createClienteDto: CreateClienteDto, @CurrentUser() usuario: Usuario) {
    return this.clientesService.create(createClienteDto, usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Listar o buscar clientes por término' })
  findAll(
    @Query('search') search?: string,
    @Query('conInactivos') conInactivos?: string,
  ) {
    return this.clientesService.findAll(search, conInactivos === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cliente' })
  update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
    @CurrentUser() usuario: Usuario,
  ) {
    return this.clientesService.update(+id, updateClienteDto, usuario);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cliente (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser() usuario: Usuario) {
    return this.clientesService.remove(+id, usuario);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar cliente dado de baja' })
  restore(@Param('id') id: string, @CurrentUser() usuario: Usuario) {
    return this.clientesService.restore(+id, usuario);
  }
}
