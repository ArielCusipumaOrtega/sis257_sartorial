import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('auditorias')
export class Auditoria {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;

  @Column({ name: 'usuario_nombre', length: 255 })
  usuarioNombre: string;

  @Column({ length: 50 })
  accion: string; // 'CREAR' | 'EDITAR' | 'ELIMINAR'

  @Column({ length: 100 })
  tabla: string;

  @Column({ name: 'registro_id', nullable: true })
  registroId: number;

  @Column({ type: 'text', nullable: true })
  detalle: string;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId: number;
}
