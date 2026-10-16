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

  findAll(conInactivos: boolean = false) {
    return this.proveedorRepository.find({
      order: { nombre: 'ASC' },
      relations: ['productos'],
      withDeleted: conInactivos,
    });
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
