import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('marcas')
export class Marca {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ name: 'pais_origen', length: 100, nullable: true })
  paisOrigen: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  fechaCreacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion', type: 'timestamp', nullable: true })
  fechaEliminacion: Date;

  @OneToMany(() => Producto, (producto) => producto.marca)
  productos: Producto[];
}
