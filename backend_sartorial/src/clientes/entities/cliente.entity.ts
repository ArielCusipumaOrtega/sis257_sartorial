import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Venta } from '../../ventas/entities/venta.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { MedidaCliente } from '../../medidas-cliente/entities/medida-cliente.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ name: 'ci_nit', length: 50, nullable: true })
  ciNit: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 100, nullable: true })
  correo: string;

  @Column({ length: 255, nullable: true })
  direccion: string;

  @Column({ name: 'preferencia_talla', length: 50, nullable: true, default: 'M (40)' })
  preferenciaTalla: string;

  @Column({ default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  fechaCreacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion', type: 'timestamp', nullable: true })
  fechaEliminacion: Date;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId?: number;

  @OneToOne(() => Usuario, (usuario) => usuario.cliente, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  @OneToMany(() => Venta, (venta) => venta.cliente)
  ventas: Venta[];

  @OneToMany(() => MedidaCliente, (medida) => medida.cliente)
  medidas: MedidaCliente[];
}
