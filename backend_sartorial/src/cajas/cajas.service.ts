import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja } from './entities/caja.entity';
import { AperturaCajaDto, CierreCajaDto } from './dto/caja.dto';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class CajasService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async getCajaActiva(usuarioId: number): Promise<Caja | null> {
    return this.cajaRepository.findOne({
      where: { usuarioId, estado: 'Abierta' },
      order: { id: 'DESC' },
    });
  }

  async abrirCaja(dto: AperturaCajaDto, usuario: Usuario) {
    const activa = await this.getCajaActiva(usuario.id);
    if (activa) {
      throw new BadRequestException('Ya cuenta con una caja abierta. Debe cerrarla antes de abrir una nueva.');
    }

    const nuevaCaja = this.cajaRepository.create({
      montoApertura: dto.montoApertura,
      observaciones: dto.observaciones,
      usuarioId: usuario.id,
      estado: 'Abierta',
      ventasEfectivo: 0,
      ventasTarjeta: 0,
      ventasQr: 0,
    });
    const saved = await this.cajaRepository.save(nuevaCaja);

    await this.auditoriaService.registrar(
      `${usuario.nombre} ${usuario.apellido}`,
      'CREAR',
      'cajas_apertura',
      saved.id,
      { montoApertura: dto.montoApertura },
      usuario.id,
    );

    return saved;
  }

  async cerrarCaja(id: number, dto: CierreCajaDto, usuario: Usuario) {
    const caja = await this.cajaRepository.findOne({ where: { id } });
    if (!caja) throw new NotFoundException('Caja no encontrada');
    if (caja.estado === 'Cerrada') throw new BadRequestException('La caja ya se encuentra cerrada');

    const totalEsperado = Number(caja.montoApertura) + Number(caja.ventasEfectivo);
    const diferencia = Number(dto.montoCierre) - totalEsperado;

    caja.fechaCierre = new Date();
    caja.montoCierre = dto.montoCierre;
    caja.diferencia = diferencia;
    caja.estado = 'Cerrada';
    if (dto.observaciones) {
      caja.observaciones = (caja.observaciones ? caja.observaciones + ' | ' : '') + dto.observaciones;
    }

    const saved = await this.cajaRepository.save(caja);

    await this.auditoriaService.registrar(
      `${usuario.nombre} ${usuario.apellido}`,
      'EDITAR',
      'cajas_cierre',
      saved.id,
      { montoCierre: dto.montoCierre, diferencia },
      usuario.id,
    );

    return saved;
  }

  findAll() {
    return this.cajaRepository.find({
      relations: ['usuario'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const caja = await this.cajaRepository.findOne({
      where: { id },
      relations: ['usuario', 'ventas', 'ventas.detalles'],
    });
    if (!caja) throw new NotFoundException(`Caja con ID ${id} no encontrada`);
    return caja;
  }
}
