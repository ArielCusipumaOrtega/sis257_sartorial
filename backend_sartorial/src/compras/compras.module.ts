import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compra } from './entities/compra.entity';
import { DetalleCompra } from '../detalles-compra/entities/detalle-compra.entity';
import { Producto } from '../productos/entities/producto.entity';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Compra, DetalleCompra, Producto])],
  controllers: [ComprasController],
  providers: [ComprasService],
  exports: [ComprasService, TypeOrmModule],
})
export class ComprasModule {}
