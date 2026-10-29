import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from '../detalles-venta/entities/detalle-venta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { ComboProducto } from '../productos/entities/combo-producto.entity';
import { Delivery } from './entities/delivery.entity';
import { Caja } from '../cajas/entities/caja.entity';
import { MetodoPago } from '../metodos-pago/entities/metodo-pago.entity';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta,
      DetalleVenta,
      Producto,
      Pago,
      Cliente,
      ComboProducto,
      Delivery,
      Caja,
      MetodoPago,
    ]),
  ],
  controllers: [VentasController, DeliveriesController],
  providers: [VentasService, DeliveriesService],
  exports: [VentasService, DeliveriesService, TypeOrmModule],
})
export class VentasModule {}
