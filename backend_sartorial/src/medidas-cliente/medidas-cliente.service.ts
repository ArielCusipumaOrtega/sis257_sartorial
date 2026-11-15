import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedidaCliente } from './entities/medida-cliente.entity';
import { CreateMedidaClienteDto } from './dto/create-medida-cliente.dto';
import { UpdateMedidaClienteDto } from './dto/update-medida-cliente.dto';
import { Cliente } from '../clientes/entities/cliente.entity';

@Injectable()
export class MedidasClienteService {
  constructor(
    @InjectRepository(MedidaCliente)
    private readonly medidaRepo: Repository<MedidaCliente>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async create(createDto: CreateMedidaClienteDto): Promise<MedidaCliente> {
    const cliente = await this.clienteRepo.findOne({ where: { id: createDto.clienteId } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${createDto.clienteId} no encontrado`);
    }

    const nuevaMedida = this.medidaRepo.create(createDto);
    return await this.medidaRepo.save(nuevaMedida);
  }

  async findAll(clienteId?: number): Promise<MedidaCliente[]> {
    const where: any = {};
    if (clienteId) {
      where.clienteId = clienteId;
    }
    return await this.medidaRepo.find({
      where,
      relations: ['cliente'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<MedidaCliente> {
    const medida = await this.medidaRepo.findOne({
      where: { id },
      relations: ['cliente'],
    });
    if (!medida) {
      throw new NotFoundException(`Ficha de medidas #${id} no encontrada`);
    }
    return medida;
  }

  async findByCliente(clienteId: number): Promise<MedidaCliente[]> {
    return await this.medidaRepo.find({
      where: { clienteId },
      order: { id: 'DESC' },
    });
  }

  async findUltimaByCliente(clienteId: number): Promise<MedidaCliente | null> {
    return await this.medidaRepo.findOne({
      where: { clienteId },
      order: { id: 'DESC' },
    });
  }

  async update(id: number, updateDto: UpdateMedidaClienteDto): Promise<MedidaCliente> {
    const medida = await this.findOne(id);
    Object.assign(medida, updateDto);
    return await this.medidaRepo.save(medida);
  }

  async remove(id: number): Promise<MedidaCliente> {
    const medida = await this.findOne(id);
    return await this.medidaRepo.softRemove(medida);
  }

  async restore(id: number): Promise<MedidaCliente> {
    await this.medidaRepo.restore(id);
    return await this.findOne(id);
  }
}
