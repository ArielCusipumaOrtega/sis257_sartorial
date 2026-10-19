import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@ApiTags('Combos & Outfits')
@Controller('combos')
export class CombosController {
  constructor(private readonly productosService: ProductosService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear nuevo outfit / combo completo' })
  createCombo(@Body() createComboDto: CreateComboDto, @CurrentUser() usuario: Usuario) {
    return this.productosService.createCombo(createComboDto, usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los outfits y colecciones' })
  findAllCombos() {
    return this.productosService.findCombos();
  }
}
