import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsesorEstiloController } from './asesor-estilo.controller';
import { AsesorEstiloService } from './asesor-estilo.service';
import { Producto } from '../productos/entities/producto.entity';
import { MedidaCliente } from '../medidas-cliente/entities/medida-cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, MedidaCliente])],
  controllers: [AsesorEstiloController],
  providers: [AsesorEstiloService],
  exports: [AsesorEstiloService],
})
export class AsesorEstiloModule {}
