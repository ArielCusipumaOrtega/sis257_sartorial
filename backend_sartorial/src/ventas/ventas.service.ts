import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Venta, EstadoVenta } from './entities/venta.entity';
import { DetalleVenta } from '../detalles-venta/entities/detalle-venta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ComboProducto } from '../productos/entities/combo-producto.entity';
import { Delivery } from './entities/delivery.entity';
import { Caja } from '../cajas/entities/caja.entity';
import { MetodoPago } from '../metodos-pago/entities/metodo-pago.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository: Repository<DetalleVenta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly dataSource: DataSource,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  private async getConsumidorFinal(manager: any): Promise<Cliente> {
    let consumidor = await manager.findOne(Cliente, {
      where: { ciNit: '0', nombre: 'Cliente', apellido: 'Ocasional' },
    });
    if (!consumidor) {
      consumidor = manager.create(Cliente, {
        nombre: 'Cliente',
        apellido: 'Ocasional',
        ciNit: '0',
        estado: true,
        preferenciaTalla: 'General',
      });
      consumidor = await manager.save(consumidor);
    }
    return consumidor;
  }

  async create(createVentaDto: CreateVentaDto, usuarioAutenticado: Usuario | null = null): Promise<Venta> {
    if (!createVentaDto.detalles || createVentaDto.detalles.length === 0) {
      throw new BadRequestException('El pedido debe contener al menos una prenda o producto');
    }

    if (createVentaDto.canal === 'ONLINE_WEB' && !usuarioAutenticado) {
      throw new UnauthorizedException('Debe iniciar sesión para realizar compras en la boutique virtual');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        detalles,
        pagos,
        clienteId,
        comprobanteQr,
        tipoEntrega,
        direccion,
        referencia,
        telefonoContacto,
        costoDelivery,
        latitud,
        longitud,
        ...ventaData
      } = createVentaDto;

      // Resolver cliente
      let resolvedClienteId: number;
      if (clienteId && clienteId > 0) {
        resolvedClienteId = clienteId;
      } else {
        const consumidor = await this.getConsumidorFinal(queryRunner.manager);
        resolvedClienteId = consumidor.id;
      }

      // Buscar caja activa para el usuario autenticado
      let resolvedCajaId: number | null = null;
      let activeCaja: Caja | null = null;
      if (usuarioAutenticado) {
        activeCaja = await queryRunner.manager.findOne(Caja, {
          where: { usuarioId: usuarioAutenticado.id, estado: 'Abierta' },
        });
        if (activeCaja) {
          resolvedCajaId = activeCaja.id;
        }
      }

      // Validar stock y calcular total
      let total = 0;
      for (const det of detalles) {
        const producto = await queryRunner.manager.findOne(Producto, {
          where: { id: det.productoId },
        });
        if (!producto) {
          throw new NotFoundException(`Prenda con ID ${det.productoId} no encontrada`);
        }

        if (producto.esCombo) {
          const comboItems = det.componentes && det.componentes.length > 0
            ? det.componentes
            : await queryRunner.manager.find(ComboProducto, {
                where: { comboId: producto.id },
              });
          if (comboItems.length === 0) {
            throw new BadRequestException(`El outfit "${producto.nombre}" no tiene prendas asociadas.`);
          }
          for (const item of comboItems) {
            const subProduct = await queryRunner.manager.findOne(Producto, {
              where: { id: item.productoId },
            });
            if (!subProduct) {
              throw new NotFoundException(`Prenda del outfit con ID ${item.productoId} no encontrada`);
            }
            const subReq = item.cantidad * det.cantidad;
            if (Number(subProduct.stock) < subReq) {
              throw new BadRequestException(
                `Stock insuficiente para la prenda "${subProduct.nombre}" del outfit "${producto.nombre}". Disponible: ${subProduct.stock}, Solicitado: ${subReq}`,
              );
            }
          }
        } else {
          if (Number(producto.stock) < det.cantidad) {
            throw new BadRequestException(
              `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, Solicitado: ${det.cantidad}`,
            );
          }
        }
        total += det.cantidad * det.precio;
      }

      // Generar código de comprobante único: FAC-XXXXX
      const codigoComprobante = `TKT-${Date.now().toString().slice(-6)}`;

      // Crear venta
      const venta = queryRunner.manager.create(Venta, {
        ...ventaData,
        codigoComprobante,
        clienteId: resolvedClienteId,
        usuarioId: usuarioAutenticado ? usuarioAutenticado.id : null,
        total,
        fecha: new Date(),
        estado: (ventaData.estado as EstadoVenta) || 'Confirmada',
        comprobanteQr: comprobanteQr || undefined,
        tipoEntrega: tipoEntrega || 'Tienda',
        direccionEntrega: tipoEntrega === 'Delivery' ? (direccion || undefined) : undefined,
        cajaId: resolvedCajaId,
      });
      const savedVenta = await queryRunner.manager.save(venta);

      // Crear registro de delivery si corresponde
      if (tipoEntrega === 'Delivery') {
        const delivery = queryRunner.manager.create(Delivery, {
          ventaId: savedVenta.id,
          direccion: direccion || 'Dirección no provista',
          referencia: referencia || undefined,
          telefonoContacto: telefonoContacto || '00000000',
          costoDelivery: costoDelivery !== undefined ? costoDelivery : 15.00,
          latitud: latitud || null,
          longitud: longitud || null,
          estado: 'Pendiente',
        });
        await queryRunner.manager.save(delivery);
      }

      // Crear detalles de venta y actualizar existencias (stock)
      for (const det of detalles) {
        const subtotal = det.cantidad * det.precio;
        const detalle = queryRunner.manager.create(DetalleVenta, {
          ventaId: savedVenta.id,
          productoId: det.productoId,
          cantidad: det.cantidad,
          precio: det.precio,
          subtotal,
          talla: det.talla,
          color: det.color,
        });
        await queryRunner.manager.save(detalle);

        const producto = await queryRunner.manager.findOne(Producto, {
          where: { id: det.productoId },
        });

        if (producto.esCombo) {
          const comboItems = det.componentes && det.componentes.length > 0
            ? det.componentes
            : await queryRunner.manager.find(ComboProducto, {
                where: { comboId: producto.id },
              });
          for (const item of comboItems) {
            await queryRunner.manager.decrement(
              Producto,
              { id: item.productoId },
              'stock',
              item.cantidad * det.cantidad,
            );
          }
        } else {
          await queryRunner.manager.decrement(
            Producto,
            { id: det.productoId },
            'stock',
            det.cantidad,
          );
        }
      }

      // Procesar pagos y actualizar saldos de caja activa
      if (pagos && pagos.length > 0) {
        for (const p of pagos) {
          const pago = queryRunner.manager.create(Pago, {
            ventaId: savedVenta.id,
            metodoPagoId: p.metodoPagoId,
            monto: p.monto,
            referencia: p.referencia || undefined,
            fecha: new Date(),
          });
          await queryRunner.manager.save(pago);

          // Si la caja está abierta, sumar el monto por método
          if (activeCaja) {
            const metodo = await queryRunner.manager.findOne(MetodoPago, {
              where: { id: p.metodoPagoId },
            });
            if (metodo) {
              const nombreMetodo = metodo.nombre.toLowerCase();
              if (nombreMetodo.includes('efectivo')) {
                activeCaja.ventasEfectivo = Number(activeCaja.ventasEfectivo || 0) + Number(p.monto);
              } else if (nombreMetodo.includes('tarjeta')) {
                activeCaja.ventasTarjeta = Number(activeCaja.ventasTarjeta || 0) + Number(p.monto);
              } else if (nombreMetodo.includes('qr') || nombreMetodo.includes('transfer')) {
                activeCaja.ventasQr = Number(activeCaja.ventasQr || 0) + Number(p.monto);
              }
              await queryRunner.manager.save(activeCaja);
            }
          }
        }
      }

      await queryRunner.commitTransaction();

      // Auditoría
      await this.auditoriaService.registrar(
        usuarioAutenticado ? `${usuarioAutenticado.nombre} ${usuarioAutenticado.apellido}` : 'Cliente E-commerce',
        'CREAR',
        'ventas',
        savedVenta.id,
        {
          comprobante: codigoComprobante,
          total,
          clienteId: resolvedClienteId,
          tipoEntrega: savedVenta.tipoEntrega,
        },
        usuarioAutenticado?.id,
      );

      return this.findOne(savedVenta.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query?: { clienteId?: number; estado?: string; usuarioId?: number; limit?: number }) {
    const qb = this.ventaRepository.createQueryBuilder('v')
      .leftJoinAndSelect('v.cliente', 'c')
      .leftJoinAndSelect('v.usuario', 'u')
      .leftJoinAndSelect('v.detalles', 'd')
      .leftJoinAndSelect('d.producto', 'p')
      .leftJoinAndSelect('v.pagos', 'pg')
      .leftJoinAndSelect('pg.metodoPago', 'mp')
      .leftJoinAndSelect('v.delivery', 'del')
      .orderBy('v.fecha', 'DESC');

    if (query?.clienteId) {
      qb.andWhere('v.clienteId = :clienteId', { clienteId: query.clienteId });
    }
    if (query?.estado) {
      qb.andWhere('v.estado = :estado', { estado: query.estado });
    }
    if (query?.usuarioId) {
      qb.andWhere('v.usuarioId = :usuarioId', { usuarioId: query.usuarioId });
    }
    if (query?.limit) {
      qb.take(query.limit);
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: [
        'cliente',
        'usuario',
        'detalles',
        'detalles.producto',
        'pagos',
        'pagos.metodoPago',
        'delivery',
        'caja',
      ],
    });
    if (!venta) throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    return venta;
  }

  async cancelar(id: number, usuario: Usuario) {
    const venta = await this.findOne(id);
    if (venta.estado === 'Cancelada') {
      throw new BadRequestException('La venta ya se encuentra cancelada');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Revertir stock de las prendas
      for (const d of venta.detalles) {
        if (d.producto.esCombo) {
          const comboItems = await queryRunner.manager.find(ComboProducto, {
            where: { comboId: d.producto.id },
          });
          for (const item of comboItems) {
            await queryRunner.manager.increment(
              Producto,
              { id: item.productoId },
              'stock',
              item.cantidad * d.cantidad,
            );
          }
        } else {
          await queryRunner.manager.increment(
            Producto,
            { id: d.productoId },
            'stock',
            d.cantidad,
          );
        }
      }

      venta.estado = 'Cancelada';
      const saved = await queryRunner.manager.save(venta);
      await queryRunner.commitTransaction();

      await this.auditoriaService.registrar(
        `${usuario.nombre} ${usuario.apellido}`,
        'EDITAR',
        'ventas_cancelacion',
        saved.id,
        { id, motivo: 'Cancelación de venta' },
        usuario.id,
      );

      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getEstadisticas() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Ventas hoy
    const ventasHoy = await this.ventaRepository
      .createQueryBuilder('v')
      .where('v.fecha >= :today', { today: startOfToday })
      .andWhere('v.estado = :est', { est: 'Confirmada' })
      .getMany();

    const totalHoy = ventasHoy.reduce((acc, v) => acc + Number(v.total), 0);

    // Ventas mes
    const ventasMes = await this.ventaRepository
      .createQueryBuilder('v')
      .where('v.fecha >= :month', { month: startOfMonth })
      .andWhere('v.estado = :est', { est: 'Confirmada' })
      .getMany();

    const totalMes = ventasMes.reduce((acc, v) => acc + Number(v.total), 0);

    // Conteo total ventas
    const totalTransacciones = await this.ventaRepository.count({ where: { estado: 'Confirmada' } });

    // Productos con stock bajo
    const stockBajo = await this.productoRepository
      .createQueryBuilder('p')
      .where('p.stock <= p.stockMinimo')
      .andWhere('p.estado = true')
      .getMany();

    return {
      ventasHoyCantidad: ventasHoy.length,
      ventasHoyMonto: totalHoy,
      ventasMesCantidad: ventasMes.length,
      ventasMesMonto: totalMes,
      totalTransacciones,
      alertasStockBajo: stockBajo.length,
      itemsStockBajo: stockBajo,
    };
  }

  async remove(id: number, usuario?: Usuario) {
    const venta = await this.findOne(id);
    const removed = await this.ventaRepository.softRemove(venta);
    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'ELIMINAR',
      'ventas',
      id,
      { id, codigoComprobante: venta.codigoComprobante, softDelete: true },
      usuario?.id,
    );
    return removed;
  }

  async restore(id: number, usuario?: Usuario) {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!venta) throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    await this.ventaRepository.restore(id);
    await this.auditoriaService.registrar(
      usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema',
      'EDITAR',
      'ventas_restauracion',
      id,
      { id, codigoComprobante: venta.codigoComprobante, restaurada: true },
      usuario?.id,
    );
    return this.findOne(id);
  }
}
