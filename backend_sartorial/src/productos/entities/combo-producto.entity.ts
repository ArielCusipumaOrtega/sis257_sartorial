import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from './producto.entity';

@Entity('combo_productos')
export class ComboProducto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'combo_id' })
  comboId: number;

  @Column({ name: 'producto_id' })
  productoId: number;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @ManyToOne(() => Producto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'combo_id' })
  combo: Producto;

  @ManyToOne(() => Producto, { eager: true })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}
