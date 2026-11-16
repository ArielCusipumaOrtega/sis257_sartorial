import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  create(createProveedorDto: CreateProveedorDto) {
    const proveedor = this.proveedorRepository.create(createProveedorDto);
    return this.proveedorRepository.save(proveedor);
  }

  async findAll(query?: {
    conInactivos?: boolean;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
    all?: boolean;
  } | boolean) {
    const q = typeof query === 'boolean' ? { conInactivos: query, all: true } : query;

    const qb = this.proveedorRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.productos', 'prod');

    if (q?.conInactivos) {
      qb.withDeleted();
    } else {
      qb.andWhere('p.estado = :estado', { estado: true });
    }

    if (q?.search) {
      qb.andWhere(
        '(p.nombre ILIKE :s OR p.nit ILIKE :s OR p.correo ILIKE :s OR p.direccion ILIKE :s)',
        { s: `%${q.search}%` },
      );
    }

    const sortField = q?.sortBy ? (q.sortBy.includes('.') ? q.sortBy : `p.${q.sortBy}`) : 'p.nombre';
    const sortDir = q?.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    qb.orderBy(sortField, sortDir);

    const page = q?.page ? Math.max(1, Number(q.page)) : null;
    const limit = q?.limit ? Math.max(1, Math.min(100, Number(q.limit))) : null;
    const isPaginated = page !== null && limit !== null && !q?.all;

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
    const proveedor = await this.proveedorRepository.findOne({
      where: { id },
      relations: ['productos'],
    });
    if (!proveedor) throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    return proveedor;
  }

  async update(id: number, updateProveedorDto: UpdateProveedorDto) {
    const proveedor = await this.findOne(id);
    Object.assign(proveedor, updateProveedorDto);
    return this.proveedorRepository.save(proveedor);
  }

  async remove(id: number) {
    const proveedor = await this.findOne(id);
    proveedor.estado = false;
    await this.proveedorRepository.save(proveedor);
    return this.proveedorRepository.softRemove(proveedor);
  }

  async restore(id: number) {
    const proveedor = await this.proveedorRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!proveedor) throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    await this.proveedorRepository.restore(id);
    proveedor.estado = true;
    return this.proveedorRepository.save(proveedor);
  }
}
