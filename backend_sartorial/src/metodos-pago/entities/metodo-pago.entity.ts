import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Pago } from '../../pagos/entities/pago.entity';

@Entity('metodos_pago')
export class MetodoPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  nombre: string;

  @Column({ length: 255, nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Pago, (pago) => pago.metodoPago)
  pagos: Pago[];
}
