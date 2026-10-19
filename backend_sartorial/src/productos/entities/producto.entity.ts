import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { Marca } from '../../marcas/entities/marca.entity';
import { Proveedor } from '../../proveedores/entities/proveedor.entity';
import { Promocion } from '../../promociones/entities/promocion.entity';
import { DetalleCompra } from '../../detalles-compra/entities/detalle-compra.entity';
import { DetalleVenta } from '../../detalles-venta/entities/detalle-venta.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 1000, nullable: true })
  descripcion: string;

  @Column({ length: 50, unique: true })
  codigo: string;

  @Column({ name: 'precio_compra', type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioCompra: number;

  @Column({ name: 'precio_venta', type: 'decimal', precision: 10, scale: 2 })
  precioVenta: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'stock_minimo', type: 'int', default: 3 })
  stockMinimo: number;

  @Column({ length: 500, nullable: true })
  imagen: string;

  // Atributos de alta costura / confección formal
  @Column({ length: 50, default: '40R' })
  talla: string; // '36R', '38R', '40R', '42L', '44R', 'M', 'L', '41', etc.

  @Column({ length: 50, default: 'Negro' })
  color: string; // 'Negro Azabache', 'Azul Marino', 'Gris Marengo', etc.

  @Column({ length: 100, default: 'Lana Super 130s' })
  material: string; // 'Lana Super 130s', 'Algodón Egipcio', 'Seda Italiana', etc.

  @Column({ length: 50, default: 'Slim Fit' })
  corte: string; // 'Slim Fit', 'Classic Fit', 'Tailored Fit', 'Modern Fit'

  @Column({ length: 50, default: 'Caballeros' })
  genero: string; // 'Caballeros', 'Damas', 'Unisex'

  @Column({ name: 'es_combo', type: 'boolean', default: false })
  esCombo: boolean;

  @Column({ default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamp' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion', type: 'timestamp', nullable: true })
  fechaEliminacion: Date;

  // Relaciones
  @ManyToOne(() => Categoria, (categoria) => categoria.productos, { nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @Column({ name: 'categoria_id', nullable: true })
  categoriaId: number;

  @ManyToOne(() => Marca, (marca) => marca.productos, { nullable: true })
  @JoinColumn({ name: 'marca_id' })
  marca: Marca;

  @Column({ name: 'marca_id', nullable: true })
  marcaId: number;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.productos, { nullable: true })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;

  @Column({ name: 'proveedor_id', nullable: true })
  proveedorId: number;

  @ManyToOne(() => Promocion, (promocion) => promocion.productos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'promocion_id' })
  promocion: Promocion;

  @Column({ name: 'promocion_id', type: 'integer', nullable: true })
  promocionId: number | null;

  @OneToMany(() => DetalleCompra, (detalle) => detalle.producto)
  detallesCompra: DetalleCompra[];

  @OneToMany(() => DetalleVenta, (detalle) => detalle.producto)
  detallesVenta: DetalleVenta[];
}
