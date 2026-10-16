import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Marca } from './entities/marca.entity';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';

@Injectable()
export class MarcasService {
  constructor(
    @InjectRepository(Marca)
    private readonly marcaRepository: Repository<Marca>,
  ) {}

  create(createMarcaDto: CreateMarcaDto) {
    const marca = this.marcaRepository.create(createMarcaDto);
    return this.marcaRepository.save(marca);
  }

  findAll(conInactivos: boolean = false) {
    return this.marcaRepository.find({
      order: { nombre: 'ASC' },
      relations: ['productos'],
      withDeleted: conInactivos,
    });
  }

  async findOne(id: number) {
    const marca = await this.marcaRepository.findOne({
      where: { id },
      relations: ['productos'],
    });
    if (!marca) throw new NotFoundException(`Marca con ID ${id} no encontrada`);
    return marca;
  }

  async update(id: number, updateMarcaDto: UpdateMarcaDto) {
    const marca = await this.findOne(id);
    Object.assign(marca, updateMarcaDto);
    return this.marcaRepository.save(marca);
  }

  async remove(id: number) {
    const marca = await this.findOne(id);
    marca.estado = false;
    await this.marcaRepository.save(marca);
    return this.marcaRepository.softRemove(marca);
  }

  async restore(id: number) {
    const marca = await this.marcaRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!marca) throw new NotFoundException(`Marca con ID ${id} no encontrada`);
    await this.marcaRepository.restore(id);
    marca.estado = true;
    return this.marcaRepository.save(marca);
  }
}
