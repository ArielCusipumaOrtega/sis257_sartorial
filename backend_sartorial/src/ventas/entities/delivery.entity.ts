import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Venta } from './venta.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'venta_id' })
  ventaId: number;

  @OneToOne(() => Venta, (venta) => venta.delivery, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @Column({ length: 255 })
  direccion: string;

  @Column({ length: 255, nullable: true })
  referencia: string;

  @Column({ name: 'telefono_contacto', length: 50 })
  telefonoContacto: string;

  @Column({ name: 'costo_delivery', type: 'decimal', precision: 10, scale: 2, default: 0 })
  costoDelivery: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud: number;

  @Column({ length: 50, default: 'Pendiente' })
  estado: string; // 'Pendiente' | 'En Preparacion' | 'En Camino' | 'Entregado' | 'Cancelado'

  @Column({ name: 'fecha_estimada', type: 'timestamp', nullable: true })
  fechaEstimada: Date;
}
