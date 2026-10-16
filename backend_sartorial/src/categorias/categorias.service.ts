import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  create(createCategoriaDto: CreateCategoriaDto) {
    const categoria = this.categoriaRepository.create(createCategoriaDto);
    return this.categoriaRepository.save(categoria);
  }

  findAll(conInactivos: boolean = false) {
    return this.categoriaRepository.find({
      order: { id: 'ASC' },
      relations: ['productos'],
      withDeleted: conInactivos,
    });
  }

  async findOne(id: number) {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      relations: ['productos'],
    });
    if (!categoria) throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    const categoria = await this.findOne(id);
    Object.assign(categoria, updateCategoriaDto);
    return this.categoriaRepository.save(categoria);
  }

  async remove(id: number) {
    const categoria = await this.findOne(id);
    categoria.estado = false;
    await this.categoriaRepository.save(categoria);
    return this.categoriaRepository.softRemove(categoria);
  }

  async restore(id: number) {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!categoria) throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    await this.categoriaRepository.restore(id);
    categoria.estado = true;
    return this.categoriaRepository.save(categoria);
  }
}
