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
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
    all?: boolean;
  }) {
    const qb = this.productoRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.categoria', 'c')
      .leftJoinAndSelect('p.marca', 'm')
      .leftJoinAndSelect('p.proveedor', 'pr')
      .leftJoinAndSelect('p.promocion', 'pro');

    const sortField = query?.sortBy ? (query.sortBy.includes('.') ? query.sortBy : `p.${query.sortBy}`) : 'p.id';
    const sortDirection = query?.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortField, sortDirection);

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

    const page = query?.page ? Math.max(1, Number(query.page)) : null;
    const limit = query?.limit ? Math.max(1, Math.min(100, Number(query.limit))) : null;
    const isPaginated = page !== null && limit !== null && !query?.all;

    let items: Producto[];
    let totalCount = 0;

    if (isPaginated) {
      qb.skip((page - 1) * limit).take(limit);
      const [data, count] = await qb.getManyAndCount();
      items = data;
      totalCount = count;
    } else {
      items = await qb.getMany();
      totalCount = items.length;
    }

    // Calcular precio final con descuento promocional activo si existe
    const now = new Date();
    const mapped = items.map((p) => {
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

    if (isPaginated) {
      const totalPages = Math.ceil(totalCount / limit) || 1;
      return {
        data: mapped,
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    }

    return mapped;
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
