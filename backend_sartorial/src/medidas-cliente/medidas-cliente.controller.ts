import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MedidasClienteService } from './medidas-cliente.service';
import { CreateMedidaClienteDto } from './dto/create-medida-cliente.dto';
import { UpdateMedidaClienteDto } from './dto/update-medida-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Medidas de Cliente (Sastrería)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medidas-cliente')
export class MedidasClienteController {
  constructor(private readonly medidasService: MedidasClienteService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nueva ficha antropométrica / medidas de sastrería' })
  create(@Body() createDto: CreateMedidaClienteDto) {
    return this.medidasService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar fichas de medidas' })
  findAll(@Query('clienteId') clienteId?: string) {
    return this.medidasService.findAll(clienteId ? +clienteId : undefined);
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: 'Obtener historial de medidas de un cliente' })
  findByCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.medidasService.findByCliente(clienteId);
  }

  @Get('cliente/:clienteId/ultima')
  @ApiOperation({ summary: 'Obtener la última ficha de medidas vigente de un cliente' })
  findUltimaByCliente(@Param('clienteId', ParseIntPipe) clienteId: number) {
    return this.medidasService.findUltimaByCliente(clienteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ficha de medidas por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medidasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar medidas de sastrería' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMedidaClienteDto,
  ) {
    return this.medidasService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar lógicamente una ficha de medidas' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medidasService.remove(id);
  }

  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar una ficha de medidas eliminada' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.medidasService.restore(id);
  }
}
