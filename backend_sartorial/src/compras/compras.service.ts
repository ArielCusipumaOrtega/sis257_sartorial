import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { DetalleCompra } from '../detalles-compra/entities/detalle-compra.entity';
import { Producto } from '../productos/entities/producto.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly dataSource: DataSource,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async create(createCompraDto: CreateCompraDto, usuario: Usuario) {
    if (!createCompraDto.detalles || createCompraDto.detalles.length === 0) {
      throw new BadRequestException('La compra debe contener al menos una prenda');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let total = 0;
      for (const d of createCompraDto.detalles) {
        total += d.cantidad * d.precio;
      }

      const compra = queryRunner.manager.create(Compra, {
        proveedorId: createCompraDto.proveedorId,
        usuarioId: usuario.id,
        observaciones: createCompraDto.observaciones,
        total,
      });
      const savedCompra = await queryRunner.manager.save(compra);

      for (const d of createCompraDto.detalles) {
        const subtotal = d.cantidad * d.precio;
        const det = queryRunner.manager.create(DetalleCompra, {
          compraId: savedCompra.id,
          productoId: d.productoId,
          cantidad: d.cantidad,
          precio: d.precio,
          subtotal,
        });
        await queryRunner.manager.save(det);

        // Aumentar stock del producto e inscribir nuevo precio compra si aplica
        const prod = await queryRunner.manager.findOne(Producto, { where: { id: d.productoId } });
        if (prod) {
          prod.stock = Number(prod.stock) + Number(d.cantidad);
          prod.precioCompra = d.precio;
          await queryRunner.manager.save(prod);
        }
      }

      await queryRunner.commitTransaction();

      await this.auditoriaService.registrar(
        `${usuario.nombre} ${usuario.apellido}`,
        'CREAR',
        'compras',
        savedCompra.id,
        { compraId: savedCompra.id, total, items: createCompraDto.detalles.length },
        usuario.id,
      );

      return this.findOne(savedCompra.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query?: {
    conInactivos?: boolean;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
    all?: boolean;
  }) {
    const qb = this.compraRepository.createQueryBuilder('compra')
      .leftJoinAndSelect('compra.proveedor', 'proveedor')
      .leftJoinAndSelect('compra.usuario', 'usuario')
      .leftJoinAndSelect('compra.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto');

    if (query?.conInactivos) {
      qb.withDeleted();
    } else {
      qb.andWhere('compra.estado = :estado', { estado: true });
    }

    if (query?.search) {
      qb.andWhere(
        '(proveedor.nombre ILIKE :s OR compra.observaciones ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    const sortField = query?.sortBy ? (query.sortBy.includes('.') ? query.sortBy : `compra.${query.sortBy}`) : 'compra.fecha';
    const sortDir = query?.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortField, sortDir);

    const page = query?.page ? Math.max(1, Number(query.page)) : null;
    const limit = query?.limit ? Math.max(1, Math.min(100, Number(query.limit))) : null;
    const isPaginated = page !== null && limit !== null && !query?.all;

    if (isPaginated) {
      qb.skip((page - 1) * limit).take(limit);
      const [data, total] = await qb.getManyAndCount();
      const totalPages = Math.ceil(total / limit) || 1;
      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    const compra = await this.compraRepository.findOne({
      where: { id },
      relations: ['proveedor', 'usuario', 'detalles', 'detalles.producto'],
    });
    if (!compra) throw new NotFoundException(`Compra con ID ${id} no encontrada`);
    return compra;
  }

  async remove(id: number, usuario?: Usuario) {
    const compra = await this.findOne(id);
    const removed = await this.compraRepository.softRemove(compra);
    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'ELIMINAR',
      'compras',
      id,
      { id, total: compra.total, softDelete: true },
      usuario?.id,
    );
    return removed;
  }

  async restore(id: number, usuario?: Usuario) {
    const compra = await this.compraRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!compra) throw new NotFoundException(`Compra con ID ${id} no encontrada`);
    await this.compraRepository.restore(id);
    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'EDITAR',
      'compras_restauracion',
      id,
      { id, total: compra.total, restaurada: true },
      usuario?.id,
    );
    return this.findOne(id);
  }
}
