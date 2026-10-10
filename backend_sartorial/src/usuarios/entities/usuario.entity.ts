import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Rol } from '../../roles/entities/rol.entity';
import { Compra } from '../../compras/entities/compra.entity';
import { Venta } from '../../ventas/entities/venta.entity';
import { Caja } from '../../cajas/entities/caja.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ length: 100, unique: true })
  correo: string;

  @Column({ length: 50, unique: true })
  usuario: string;

  @Column({ length: 255 })
  password: string;

  @Column({ default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  fechaCreacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion', type: 'timestamp', nullable: true })
  fechaEliminacion: Date;

  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @Column({ name: 'rol_id' })
  rolId: number;

  @OneToMany(() => Compra, (compra) => compra.usuario)
  compras: Compra[];

  @OneToMany(() => Venta, (venta) => venta.usuario)
  ventas: Venta[];

  @OneToMany(() => Caja, (caja) => caja.usuario)
  cajas: Caja[];
}
