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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear nueva prenda de vestir formal' })
  create(@Body() createProductoDto: CreateProductoDto, @CurrentUser() usuario: Usuario) {
    return this.productosService.create(createProductoDto, usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Listar prendas con filtros por categoría, marca, talla, corte o término' })
  findAll(
    @Query('categoriaId') categoriaId?: string,
    @Query('marcaId') marcaId?: string,
    @Query('talla') talla?: string,
    @Query('corte') corte?: string,
    @Query('genero') genero?: string,
    @Query('search') search?: string,
    @Query('esCombo') esCombo?: string,
    @Query('conEliminados') conEliminados?: string,
  ) {
    return this.productosService.findAll({
      categoriaId: categoriaId ? +categoriaId : undefined,
      marcaId: marcaId ? +marcaId : undefined,
      talla,
      corte,
      genero,
      search,
      esCombo: esCombo !== undefined ? esCombo === 'true' : undefined,
      conEliminados: conEliminados === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de prenda por ID' })
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar prenda' })
  update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
    @CurrentUser() usuario: Usuario,
  ) {
    return this.productosService.update(+id, updateProductoDto, usuario);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar prenda (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser() usuario: Usuario) {
    return this.productosService.remove(+id, usuario);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/restaurar')
  @ApiOperation({ summary: 'Restaurar prenda dada de baja' })
  restore(@Param('id') id: string, @CurrentUser() usuario: Usuario) {
    return this.productosService.restore(+id, usuario);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  @ApiOperation({ summary: 'Subir imagen para prenda' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    return { url: `/uploads/${file.filename}` };
  }
}
