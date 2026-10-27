import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoPago } from './entities/metodo-pago.entity';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';

@Injectable()
export class MetodosPagoService {
  constructor(
    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,
  ) {}

  create(createMetodoPagoDto: CreateMetodoPagoDto) {
    const mp = this.metodoPagoRepository.create(createMetodoPagoDto);
    return this.metodoPagoRepository.save(mp);
  }

  findAll() {
    return this.metodoPagoRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const mp = await this.metodoPagoRepository.findOne({ where: { id } });
    if (!mp) throw new NotFoundException(`Método de pago con ID ${id} no encontrado`);
    return mp;
  }
}
