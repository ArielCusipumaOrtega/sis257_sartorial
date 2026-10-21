import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Promocion } from './entities/promocion.entity';
import { Producto } from '../productos/entities/producto.entity';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@Injectable()
export class PromocionesService {
  constructor(
    @InjectRepository(Promocion)
    private readonly promocionRepository: Repository<Promocion>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  async create(createPromocionDto: CreatePromocionDto) {
    const { productoIds, ...data } = createPromocionDto;
    const promocion = this.promocionRepository.create({
      ...data,
      fechaInicio: new Date(data.fechaInicio),
      fechaFin: new Date(data.fechaFin),
    });
    const saved = await this.promocionRepository.save(promocion);

    if (productoIds && productoIds.length > 0) {
      await this.productoRepository.update(
        { id: In(productoIds) },
        { promocionId: saved.id },
      );
    }
    return this.findOne(saved.id);
  }

  findAll(conInactivos: boolean = false) {
    return this.promocionRepository.find({
      relations: ['productos'],
      order: { id: 'DESC' },
      withDeleted: conInactivos,
    });
  }

  async findOne(id: number) {
    const promocion = await this.promocionRepository.findOne({
      where: { id },
      relations: ['productos'],
    });
    if (!promocion) throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    return promocion;
  }

  async update(id: number, updatePromocionDto: UpdatePromocionDto) {
    const promocion = await this.findOne(id);
    const { productoIds, ...data } = updatePromocionDto;

    if (data.fechaInicio) data.fechaInicio = new Date(data.fechaInicio) as any;
    if (data.fechaFin) data.fechaFin = new Date(data.fechaFin) as any;

    Object.assign(promocion, data);
    const saved = await this.promocionRepository.save(promocion);

    if (productoIds !== undefined) {
      // Desvincular productos previos
      await this.productoRepository.update({ promocionId: id }, { promocionId: null });
      if (productoIds.length > 0) {
        await this.productoRepository.update({ id: In(productoIds) }, { promocionId: id });
      }
    }
    return this.findOne(saved.id);
  }

  async remove(id: number) {
    const promocion = await this.findOne(id);
    promocion.estado = false;
    await this.promocionRepository.save(promocion);
    await this.productoRepository.update({ promocionId: id }, { promocionId: null });
    return this.promocionRepository.softRemove(promocion);
  }

  async restore(id: number) {
    const promocion = await this.promocionRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!promocion) throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    await this.promocionRepository.restore(id);
    promocion.estado = true;
    return this.promocionRepository.save(promocion);
  }
}
