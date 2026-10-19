import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { ComboProducto } from './entities/combo-producto.entity';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { CombosController } from './combos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, ComboProducto])],
  controllers: [ProductosController, CombosController],
  providers: [ProductosService],
  exports: [ProductosService, TypeOrmModule],
})
export class ProductosModule {}
