import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { ComboProducto } from './entities/combo-producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { CreateComboDto } from './dto/create-combo.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(ComboProducto)
    private readonly comboProductoRepository: Repository<ComboProducto>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async create(createProductoDto: CreateProductoDto, usuario?: Usuario) {
    const existing = await this.productoRepository.findOne({
      where: { codigo: createProductoDto.codigo },
    });
    if (existing) {
      throw new BadRequestException(`El código SKU "${createProductoDto.codigo}" ya está registrado`);
    }

    const producto = this.productoRepository.create(createProductoDto);
    const saved = await this.productoRepository.save(producto);

    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'CREAR',
      'productos',
      saved.id,
      saved,
      usuario?.id,
    );

    return saved;
  }

  async findAll(query?: {
    categoriaId?: number;
    marcaId?: number;
    talla?: string;
    corte?: string;
    genero?: string;
    search?: string;
    esCombo?: boolean;
    conEliminados?: boolean;
  }) {
    const qb = this.productoRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.categoria', 'c')
      .leftJoinAndSelect('p.marca', 'm')
      .leftJoinAndSelect('p.proveedor', 'pr')
      .leftJoinAndSelect('p.promocion', 'pro')
      .orderBy('p.id', 'DESC');

    if (query?.conEliminados) {
      qb.withDeleted();
    } else {
      qb.andWhere('p.estado = :estado', { estado: true });
    }

    if (query?.categoriaId) {
      qb.andWhere('p.categoriaId = :catId', { catId: query.categoriaId });
    }
    if (query?.marcaId) {
      qb.andWhere('p.marcaId = :marcaId', { marcaId: query.marcaId });
    }
    if (query?.talla) {
      qb.andWhere('p.talla = :talla', { talla: query.talla });
    }
    if (query?.corte) {
      qb.andWhere('p.corte = :corte', { corte: query.corte });
    }
    if (query?.genero) {
      qb.andWhere('p.genero = :genero', { genero: query.genero });
    }
    if (query?.esCombo !== undefined) {
      qb.andWhere('p.esCombo = :esCombo', { esCombo: query.esCombo });
    }
    if (query?.search) {
      qb.andWhere(
        '(p.nombre ILIKE :s OR p.codigo ILIKE :s OR p.color ILIKE :s OR p.material ILIKE :s OR c.nombre ILIKE :s OR m.nombre ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    const items = await qb.getMany();

    // Calcular precio final con descuento promocional activo si existe
    const now = new Date();
    return items.map((p) => {
      let descuentoPorcentaje = 0;
      if (
        p.promocion &&
        p.promocion.estado &&
        new Date(p.promocion.fechaInicio) <= now &&
        new Date(p.promocion.fechaFin) >= now
      ) {
        descuentoPorcentaje = Number(p.promocion.descuento) || 0;
      }
      const precioVenta = Number(p.precioVenta);
      const precioFinal = descuentoPorcentaje > 0
        ? Number((precioVenta * (1 - descuentoPorcentaje / 100)).toFixed(2))
        : precioVenta;

      return {
        ...p,
        descuentoPorcentaje,
        precioFinal,
      };
    });
  }

  async findOne(id: number) {
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: ['categoria', 'marca', 'proveedor', 'promocion'],
    });
    if (!producto) throw new NotFoundException(`Producto con ID ${id} no encontrado`);

    let comboItems: any[] = [];
    if (producto.esCombo) {
      comboItems = await this.comboProductoRepository.find({
        where: { comboId: id },
        relations: ['producto'],
      });
    }

    return { ...producto, comboItems };
  }

  async update(id: number, updateProductoDto: UpdateProductoDto, usuario?: Usuario) {
    const producto = await this.productoRepository.findOne({ where: { id } });
    if (!producto) throw new NotFoundException(`Producto con ID ${id} no encontrado`);

    Object.assign(producto, updateProductoDto);
    const updated = await this.productoRepository.save(producto);

    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'EDITAR',
      'productos',
      updated.id,
      updateProductoDto,
      usuario?.id,
    );

    return updated;
  }

  async remove(id: number, usuario?: Usuario) {
    const producto = await this.productoRepository.findOne({ where: { id } });
    if (!producto) throw new NotFoundException(`Producto con ID ${id} no encontrado`);

    producto.estado = false;
    await this.productoRepository.save(producto);
    const removed = await this.productoRepository.softRemove(producto);

    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'ELIMINAR',
      'productos',
      id,
      { id, nombre: producto.nombre, codigo: producto.codigo, softDelete: true },
      usuario?.id,
    );

    return removed;
  }

  async restore(id: number, usuario?: Usuario) {
    const producto = await this.productoRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!producto) throw new NotFoundException(`Producto con ID ${id} no encontrado`);

    await this.productoRepository.restore(id);
    producto.estado = true;
    const restored = await this.productoRepository.save(producto);

    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'EDITAR',
      'productos_restauracion',
      id,
      { id, nombre: producto.nombre, codigo: producto.codigo, restaurado: true },
      usuario?.id,
    );

    return restored;
  }

  // ===== GESTIÓN DE COMBOS / OUTFITS COMPLETOS =====
  async createCombo(createComboDto: CreateComboDto, usuario?: Usuario) {
    const comboProducto = this.productoRepository.create({
      nombre: createComboDto.nombre,
      descripcion: createComboDto.descripcion,
      codigo: createComboDto.codigo,
      precioVenta: createComboDto.precioVenta,
      precioCompra: createComboDto.precioCompra || 0,
      stock: createComboDto.stock || 10,
      imagen: createComboDto.imagen,
      esCombo: true,
      talla: 'Varias',
      color: 'Set Completo',
      material: 'Combinación Sastrería',
      corte: 'Outfit Completo',
      genero: 'Caballeros',
      estado: true,
    });
    const savedCombo = await this.productoRepository.save(comboProducto);

    for (const item of createComboDto.items) {
      const ci = this.comboProductoRepository.create({
        comboId: savedCombo.id,
        productoId: item.productoId,
        cantidad: item.cantidad,
      });
      await this.comboProductoRepository.save(ci);
    }

    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'CREAR',
      'combos_outfits',
      savedCombo.id,
      createComboDto,
      usuario?.id,
    );

    return this.findOne(savedCombo.id);
  }

  async findCombos() {
    const combos = await this.productoRepository.find({
      where: { esCombo: true, estado: true },
      relations: ['categoria', 'marca', 'promocion'],
      order: { id: 'DESC' },
    });

    const results = [];
    for (const combo of combos) {
      const items = await this.comboProductoRepository.find({
        where: { comboId: combo.id },
        relations: ['producto'],
      });
      results.push({ ...combo, items });
    }
    return results;
  }
}
