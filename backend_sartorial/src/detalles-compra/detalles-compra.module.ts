import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleCompra } from './entities/detalle-compra.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleCompra])],
  exports: [TypeOrmModule],
})
export class DetallesCompraModule {}
