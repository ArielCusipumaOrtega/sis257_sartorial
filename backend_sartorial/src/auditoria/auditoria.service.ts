import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from './entities/auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  async registrar(
    usuarioNombre: string,
    accion: string,
    tabla: string,
    registroId: number | null = null,
    detalle: any = null,
    usuarioId: number | null = null,
  ): Promise<Auditoria> {
    const detalleStr = typeof detalle === 'object' ? JSON.stringify(detalle) : String(detalle || '');
    const log = this.auditoriaRepository.create({
      usuarioNombre: usuarioNombre || 'Sistema Automático',
      accion,
      tabla,
      registroId,
      detalle: detalleStr,
      usuarioId,
    });
    return this.auditoriaRepository.save(log);
  }

  async findAll(limit: number = 50, offset: number = 0, tabla?: string, accion?: string) {
    const query = this.auditoriaRepository.createQueryBuilder('a')
      .leftJoinAndSelect('a.usuario', 'u')
      .orderBy('a.fecha', 'DESC')
      .take(limit)
      .skip(offset);

    if (tabla) {
      query.andWhere('a.tabla ILIKE :tabla', { tabla: `%${tabla}%` });
    }
    if (accion) {
      query.andWhere('a.accion = :accion', { accion });
    }

    const [items, total] = await query.getManyAndCount();
    return { items, total };
  }
}
