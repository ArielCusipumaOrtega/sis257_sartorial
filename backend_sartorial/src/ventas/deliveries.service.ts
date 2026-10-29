import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
  ) {}

  findAll() {
    return this.deliveryRepository.find({
      relations: ['venta', 'venta.cliente', 'venta.detalles', 'venta.detalles.producto'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const d = await this.deliveryRepository.findOne({
      where: { id },
      relations: ['venta', 'venta.cliente', 'venta.detalles', 'venta.detalles.producto'],
    });
    if (!d) throw new NotFoundException(`Delivery con ID ${id} no encontrado`);
    return d;
  }

  async updateEstado(id: number, estado: string) {
    const d = await this.findOne(id);
    d.estado = estado;
    return this.deliveryRepository.save(d);
  }
}
