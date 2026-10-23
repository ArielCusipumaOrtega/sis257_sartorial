import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Usuario } from '../usuarios/entities/usuario.entity';

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

  findAll(search?: string, conInactivos: boolean = false) {
    const query = this.clienteRepository.createQueryBuilder('c')
      .orderBy('c.nombre', 'ASC');

    if (conInactivos) {
      query.withDeleted();
    } else {
      query.andWhere('c.estado = :estado', { estado: true });
    }

    if (search) {
      query.andWhere(
        '(c.nombre ILIKE :s OR c.apellido ILIKE :s OR c.ciNit ILIKE :s OR c.telefono ILIKE :s)',
        { s: `%${search}%` },
      );
    }
    return query.getMany();
  }

  async findOne(id: number) {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['ventas'],
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

    await this.clienteRepository.restore(id);
    cliente.estado = true;
    const restored = await this.clienteRepository.save(cliente);

    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'EDITAR',
      'clientes_restauracion',
      id,
      { id, nombre: cliente.nombre, apellido: cliente.apellido, restaurado: true },
      usuario?.id,
    );

    return restored;
  }
}
