import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { paginateQuery } from '../common/helpers/pagination.helper';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async create(createClienteDto: CreateClienteDto, usuario?: Usuario) {
    const cliente = this.clienteRepository.create(createClienteDto);
    const saved = await this.clienteRepository.save(cliente);

    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'CREAR',
      'clientes',
      saved.id,
      saved,
      usuario?.id,
    );

    return saved;
  }

  async findAll(paginationDto?: PaginationDto) {
    const dto = paginationDto || new PaginationDto();

    const query = this.clienteRepository.createQueryBuilder('c')
      .leftJoinAndSelect('c.medidas', 'medidas')
      .leftJoinAndSelect('c.usuario', 'usuario');

    if (dto.conInactivos) {
      query.withDeleted();
    } else {
      query.andWhere('c.estado = :estado', { estado: true });
    }

    if (dto.search) {
      query.andWhere(
        '(c.nombre ILIKE :s OR c.apellido ILIKE :s OR c.ciNit ILIKE :s OR c.telefono ILIKE :s OR c.correo ILIKE :s)',
        { s: `%${dto.search}%` },
      );
    }

    const sortField = dto.sortBy || 'c.id';
    const sortOrder = (dto.sortOrder?.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
    query.orderBy(sortField.includes('.') ? sortField : `c.${sortField}`, sortOrder);

    if (dto.all) {
      return await query.getMany();
    }

    return await paginateQuery(query, dto);
  }

  async findOne(id: number) {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['ventas', 'medidas', 'usuario'],
    });
    if (!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto, usuario?: Usuario) {
    const cliente = await this.findOne(id);
    Object.assign(cliente, updateClienteDto);
    const updated = await this.clienteRepository.save(cliente);

    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'EDITAR',
      'clientes',
      updated.id,
      updateClienteDto,
      usuario?.id,
    );

    return updated;
  }

  async remove(id: number, usuario?: Usuario) {
    const cliente = await this.findOne(id);
    cliente.estado = false;
    await this.clienteRepository.save(cliente);
    const removed = await this.clienteRepository.softRemove(cliente);

    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'ELIMINAR',
      'clientes',
      id,
      { id, nombre: cliente.nombre, apellido: cliente.apellido, softDelete: true },
      usuario?.id,
    );

    return removed;
  }

  async restore(id: number, usuario?: Usuario) {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!cliente) throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    cliente.estado = true;
    await this.clienteRepository.save(cliente);
    const restored = await this.clienteRepository.recover(cliente);

    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'RESTAURAR',
      'clientes',
      id,
      { id, nombre: cliente.nombre, apellido: cliente.apellido, restaurado: true },
      usuario?.id,
    );

    return restored;
  }
}
