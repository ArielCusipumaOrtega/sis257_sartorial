import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity('medidas_cliente')
export class MedidaCliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cliente_id' })
  clienteId: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.medidas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  // Medidas antropométricas de sastrería en centímetros (cm)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pecho: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  cintura: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  cadera: number;

  @Column({ name: 'hombro_a_hombro', type: 'decimal', precision: 5, scale: 2, default: 0 })
  hombroAHombro: number;

  @Column({ name: 'largo_manga', type: 'decimal', precision: 5, scale: 2, default: 0 })
  largoManga: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  cuello: number;

  @Column({ name: 'tiro_pantalon', type: 'decimal', precision: 5, scale: 2, default: 0 })
  tiroPantalon: number;

  @Column({ name: 'largo_entrepierna', type: 'decimal', precision: 5, scale: 2, default: 0 })
  largoEntrepierna: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  bastas: number;

  @Column({ name: 'ajuste_preferido', length: 50, default: 'Tailored Fit' })
  ajustePreferido: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ length: 100, nullable: true, default: 'Maestro Sastre Sartorial' })
  sastre: string;

  @Column({ name: 'fecha_medicion', type: 'date', default: () => 'CURRENT_DATE' })
  fechaMedicion: string;

  @Column({ default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  fechaCreacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion', type: 'timestamp', nullable: true })
  fechaEliminacion: Date;
}
