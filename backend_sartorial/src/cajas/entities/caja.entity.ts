import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Venta } from '../../ventas/entities/venta.entity';

@Entity('cajas')
export class Caja {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'fecha_apertura', type: 'timestamp' })
  fechaApertura: Date;

  @Column({ name: 'fecha_cierre', type: 'timestamp', nullable: true })
  fechaCierre: Date;

  @Column({ name: 'monto_apertura', type: 'decimal', precision: 12, scale: 2, default: 0 })
  montoApertura: number;

  @Column({ name: 'monto_cierre', type: 'decimal', precision: 12, scale: 2, nullable: true })
  montoCierre: number;

  @Column({ name: 'ventas_efectivo', type: 'decimal', precision: 12, scale: 2, default: 0 })
  ventasEfectivo: number;

  @Column({ name: 'ventas_tarjeta', type: 'decimal', precision: 12, scale: 2, default: 0 })
  ventasTarjeta: number;

  @Column({ name: 'ventas_qr', type: 'decimal', precision: 12, scale: 2, default: 0 })
  ventasQr: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  diferencia: number;

  @Column({ length: 50, default: 'Abierta' })
  estado: string; // 'Abierta' | 'Cerrada'

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.cajas)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @OneToMany(() => Venta, (venta) => venta.caja)
  ventas: Venta[];
}
