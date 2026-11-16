import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetalleVenta } from '../../detalles-venta/entities/detalle-venta.entity';
import { Pago } from '../../pagos/entities/pago.entity';
import { Delivery } from './delivery.entity';
import { Caja } from '../../cajas/entities/caja.entity';

export type EstadoVenta = 'Confirmada' | 'Cancelada' | 'Pendiente';
export type TipoEntrega = 'Tienda' | 'Delivery';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo_comprobante', length: 50, nullable: true })
  codigoComprobante: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({
    type: 'enum',
    enum: ['Confirmada', 'Cancelada', 'Pendiente'],
    default: 'Confirmada',
  })
  estado: EstadoVenta;

  @Column({
    name: 'tipo_entrega',
    type: 'enum',
    enum: ['Tienda', 'Delivery'],
    default: 'Tienda',
  })
  tipoEntrega: TipoEntrega;

  @Column({ name: 'direccion_entrega', length: 255, nullable: true })
  direccionEntrega: string;

  @Column({ name: 'comprobante_qr', length: 500, nullable: true })
  comprobanteQr: string;

  @Column({ length: 50, default: 'POS_TIENDA' })
  canal: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  fechaCreacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion', type: 'timestamp', nullable: true })
  fechaEliminacion: Date;

  @ManyToOne(() => Cliente, (cliente) => cliente.ventas)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'cliente_id' })
  clienteId: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.ventas, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId: number;

  @ManyToOne(() => Caja, (caja) => caja.ventas, { nullable: true })
  @JoinColumn({ name: 'caja_id' })
  caja: Caja;

  @Column({ name: 'caja_id', nullable: true })
  cajaId: number;

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, { cascade: true })
  detalles: DetalleVenta[];

  @OneToMany(() => Pago, (pago) => pago.venta, { cascade: true })
  pagos: Pago[];

  @OneToOne(() => Delivery, (delivery) => delivery.venta)
  delivery: Delivery;
}
