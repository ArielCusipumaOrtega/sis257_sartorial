import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from '../ventas/entities/venta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepo: Repository<Venta>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  // 1. TICKET TÉRMICO (80mm) EN PDF
  async generarTicketTermico(ventaId: number): Promise<Buffer> {
    const venta = await this.ventaRepo.findOne({
      where: { id: ventaId },
      relations: [
        'cliente',
        'usuario',
        'detalles',
        'detalles.producto',
        'detalles.producto.categoria',
        'pagos',
        'pagos.metodoPago',
        'delivery',
      ],
    });

    if (!venta) {
      throw new NotFoundException(`Venta #${ventaId} no encontrada`);
    }

    // Altura estimada según número de ítems (base 450pt + 35pt por cada ítem)
    const itemsCount = venta.detalles ? venta.detalles.length : 1;
    const pageHeight = Math.max(500, 380 + itemsCount * 38);

    // 80mm en puntos tipográficos (~226.77 pt)
    const doc = new (PDFDocument as any)({
      size: [226.77, pageHeight],
      margins: { top: 12, bottom: 12, left: 12, right: 12 },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    // Encabezado
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('SARTORIAL PRESTIGE', { align: 'center' })
      .fontSize(7)
      .font('Helvetica')
      .text('Boutique de Alta Confección & Estilo Formal', { align: 'center' })
      .text('Plaza 25 de Mayo #40 — Sucre, Bolivia', { align: 'center' })
      .text('NIT: 1029384021 — Tel: (+591) 4-6451234', { align: 'center' })
      .moveDown(0.5);

    // Separador punteado
    doc
      .fontSize(8)
      .text('----------------------------------------------------', { align: 'center' })
      .moveDown(0.3);

    // Información del comprobante
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(`RECIBO: ${venta.codigoComprobante}`, { align: 'left' })
      .font('Helvetica')
      .text(`Fecha: ${new Date(venta.fecha).toLocaleString('es-BO')}`)
      .text(`Canal: ${venta.canal === 'ONLINE_WEB' ? 'Boutique Online' : 'Punto de Venta (POS)'}`)
      .text(`Asesor: ${venta.usuario ? `${venta.usuario.nombre} ${venta.usuario.apellido}` : 'Venta Web'}`)
      .moveDown(0.3);

    // Datos del cliente
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('DATOS DEL CLIENTE:')
      .font('Helvetica')
      .text(`Cliente: ${venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : 'Consumidor Final'}`)
      .text(`CI/NIT: ${venta.cliente?.ciNit || '0'}`)
      .moveDown(0.4);

    // Cabecera de artículos
    doc
      .fontSize(7.5)
      .font('Helvetica-Bold')
      .text('CANT  DESCRIPCIÓN                    TOTAL (Bs.)')
      .text('----------------------------------------------------', { align: 'center' })
      .font('Helvetica');

    // Lista de prendas
    if (venta.detalles) {
      for (const d of venta.detalles) {
        const prodName = d.producto ? d.producto.nombre.slice(0, 24) : 'Prenda';
        const tallaStr = d.talla ? ` [${d.talla}]` : '';
        const subtotal = Number(d.subtotal || d.cantidad * d.precio).toFixed(2);
        doc
          .fontSize(7.5)
          .text(`${d.cantidad}x   ${prodName}${tallaStr}`)
          .text(`      P.U: Bs. ${Number(d.precio).toFixed(2)}            Bs. ${subtotal}`, { align: 'right' });
      }
    }

    if (venta.tipoEntrega === 'Delivery' && venta.delivery) {
      doc
        .fontSize(7.5)
        .text('1x   Portatraje & Despacho a Domicilio')
        .text(`      Envío especial            Bs. ${Number(venta.delivery.costoDelivery || 15).toFixed(2)}`, { align: 'right' });
    }

    doc
      .moveDown(0.3)
      .text('----------------------------------------------------', { align: 'center' })
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(`TOTAL A PAGAR: Bs. ${Number(venta.total).toFixed(2)}`, { align: 'right' })
      .moveDown(0.4);

    // Desglose de pagos
    if (venta.pagos && venta.pagos.length > 0) {
      doc.fontSize(7.5).font('Helvetica-Bold').text('PAGOS REALIZADOS:').font('Helvetica');
      for (const p of venta.pagos) {
        const metodo = p.metodoPago ? p.metodoPago.nombre : 'Pago';
        doc.text(`* ${metodo}: Bs. ${Number(p.monto).toFixed(2)}`);
      }
      doc.moveDown(0.4);
    }

    // Generar e insertar Código QR
    const qrData = `SARTORIAL-PRESTIGE|${venta.codigoComprobante}|TOTAL:${venta.total}|FECHA:${venta.fecha}|NIT:1029384021`;
    const qrBuffer = await QRCode.toBuffer(qrData, { width: 85, margin: 1 });
    doc.image(qrBuffer, (226.77 - 85) / 2, doc.y, { width: 85 });
    doc.moveDown(6.5);

    // Pie de página de cortesía
    doc
      .fontSize(6.5)
      .font('Helvetica')
      .text('Prendas de alta sastrería y distinción.', { align: 'center' })
      .text('¡Gracias por vestir con Sartorial Prestige!', { align: 'center' })
      .end();

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }

  // 2. FACTURA / RECIBO FORMAL A4 EN PDF
  async generarFacturaA4(ventaId: number): Promise<Buffer> {
    const venta = await this.ventaRepo.findOne({
      where: { id: ventaId },
      relations: [
        'cliente',
        'usuario',
        'detalles',
        'detalles.producto',
        'detalles.producto.categoria',
        'detalles.producto.marca',
        'pagos',
        'pagos.metodoPago',
        'delivery',
      ],
    });

    if (!venta) {
      throw new NotFoundException(`Venta #${ventaId} no encontrada`);
    }

    const doc = new (PDFDocument as any)({
      size: 'A4',
      margins: { top: 36, bottom: 36, left: 36, right: 36 },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    // Barra superior decorativa
    doc.rect(36, 36, 523, 6).fill('#131A26');

    // Cabecera institucional
    doc
      .fontSize(20)
      .fillColor('#131A26')
      .font('Helvetica-Bold')
      .text('SARTORIAL PRESTIGE', 40, 55)
      .fontSize(9)
      .fillColor('#64748B')
      .font('Helvetica')
      .text('ALTA CONFECCIÓN & BOUTIQUE DE CABALLEROS', 40, 78)
      .text('Plaza 25 de Mayo #40 — Sucre, Chuquisaca, Bolivia', 40, 91)
      .text('Teléfono: (+591) 4-6451234 | info@sartorialprestige.com', 40, 104);

    // Caja de Comprobante / Factura
    doc
      .rect(380, 52, 175, 75)
      .strokeColor('#D4AF37')
      .lineWidth(1.5)
      .stroke();

    doc
      .fontSize(9)
      .fillColor('#131A26')
      .font('Helvetica-Bold')
      .text('NIT: 1029384021', 390, 62)
      .text(`FACTURA PROFORMA`, 390, 77)
      .fontSize(11)
      .fillColor('#D4AF37')
      .text(`N° ${venta.codigoComprobante}`, 390, 92)
      .fontSize(8)
      .fillColor('#64748B')
      .font('Helvetica')
      .text(`Autorización: 394810293841`, 390, 110);

    // Línea divisoria
    doc.moveTo(36, 140).lineTo(559, 140).strokeColor('#E2E8F0').lineWidth(1).stroke();

    // Bloque Datos del Cliente
    doc
      .rect(36, 148, 523, 65)
      .fillAndStroke('#F8FAFC', '#E2E8F0');

    doc
      .fontSize(9)
      .fillColor('#131A26')
      .font('Helvetica-Bold')
      .text('DATOS DE LA TRANSACCIÓN & CLIENTE', 46, 156)
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor('#334155')
      .text(`Señor(es): ${venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : 'Consumidor Final'}`, 46, 172)
      .text(`Cédula / NIT: ${venta.cliente?.ciNit || '0'}`, 46, 187)
      .text(`Fecha de Emisión: ${new Date(venta.fecha).toLocaleString('es-BO')}`, 320, 172)
      .text(`Canal de Emisión: ${venta.canal === 'ONLINE_WEB' ? 'E-commerce Boutique Virtual' : 'Boutique Física (POS Mostrador)'}`, 320, 187);

    // Tabla de Ítems
    let tableY = 225;
    // Cabecera tabla
    doc
      .rect(36, tableY, 523, 22)
      .fill('#131A26');

    doc
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor('#D4AF37')
      .text('CÓDIGO', 44, tableY + 6)
      .text('DESCRIPCIÓN DE LA PRENDA', 110, tableY + 6)
      .text('TALLA / CORTE', 310, tableY + 6)
      .text('CANT.', 410, tableY + 6)
      .text('P. UNIT.', 455, tableY + 6)
      .text('SUBTOTAL', 505, tableY + 6);

    tableY += 22;

    if (venta.detalles) {
      let isEven = false;
      for (const d of venta.detalles) {
        const prod = d.producto;
        const bg = isEven ? '#F8FAFC' : '#FFFFFF';
        doc.rect(36, tableY, 523, 24).fill(bg);

        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#1E293B')
          .text(prod ? prod.codigo : 'SKU', 44, tableY + 7)
          .text(prod ? prod.nombre : 'Prenda Formal', 110, tableY + 7)
          .text(`${d.talla || prod?.talla || '-'} / ${prod?.corte || 'Clásico'}`, 310, tableY + 7)
          .text(String(d.cantidad), 415, tableY + 7)
          .text(`Bs. ${Number(d.precio).toFixed(2)}`, 450, tableY + 7)
          .text(`Bs. ${Number(d.subtotal).toFixed(2)}`, 500, tableY + 7);

        tableY += 24;
        isEven = !isEven;
      }
    }

    if (venta.tipoEntrega === 'Delivery' && venta.delivery) {
      doc.rect(36, tableY, 523, 24).fill('#F8FAFC');
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#1E293B')
        .text('LOG-01', 44, tableY + 7)
        .text('Servicio de Despacho VIP (Planchado al Vapor y Portatrajes)', 110, tableY + 7)
        .text('Especial', 310, tableY + 7)
        .text('1', 415, tableY + 7)
        .text(`Bs. ${Number(venta.delivery.costoDelivery || 15).toFixed(2)}`, 450, tableY + 7)
        .text(`Bs. ${Number(venta.delivery.costoDelivery || 15).toFixed(2)}`, 500, tableY + 7);
      tableY += 24;
    }

    // Línea inferior de tabla
    doc.moveTo(36, tableY).lineTo(559, tableY).strokeColor('#E2E8F0').stroke();
    tableY += 15;

    // Bloque de Totales y QR
    const qrData = `SARTORIAL|${venta.codigoComprobante}|${venta.total}|${venta.cliente?.ciNit || 0}|${venta.fecha}`;
    const qrBuffer = await QRCode.toBuffer(qrData, { width: 95, margin: 1 });
    doc.image(qrBuffer, 46, tableY, { width: 90 });

    doc
      .fontSize(8)
      .fillColor('#64748B')
      .font('Helvetica')
      .text('Código de Verificación Fiscal Digital', 46, tableY + 95)
      .text('Ley N° 453: La alteración de este documento constituye delito.', 46, tableY + 107);

    // Resumen de total
    doc
      .rect(350, tableY, 209, 80)
      .fillAndStroke('#F8FAFC', '#E2E8F0');

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#64748B')
      .text('Subtotal Prendas:', 360, tableY + 12)
      .text(`Bs. ${Number(venta.total).toFixed(2)}`, 480, tableY + 12, { align: 'right', width: 70 })
      .text('Descuentos Aplicados:', 360, tableY + 28)
      .text('Bs. 0.00', 480, tableY + 28, { align: 'right', width: 70 })
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#131A26')
      .text('TOTAL FACTURADO:', 360, tableY + 52)
      .fillColor('#D4AF37')
      .text(`Bs. ${Number(venta.total).toFixed(2)}`, 470, tableY + 52, { align: 'right', width: 80 });

    // Pie de página de etiqueta
    doc
      .fontSize(8)
      .fillColor('#94A3B8')
      .font('Helvetica')
      .text('Sartorial Prestige — Confección fina, paños seleccionados y tradición de alta costura.', 36, 760, {
        align: 'center',
        width: 523,
      });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }

  // 3. EXPORTACIÓN DE VENTAS A EXCEL
  async exportarVentasExcel(): Promise<Buffer> {
    const ventas = await this.ventaRepo.find({
      relations: ['cliente', 'usuario', 'detalles', 'pagos', 'pagos.metodoPago'],
      order: { id: 'DESC' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sartorial Prestige System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Ventas Boutique');

    // Título y membrete
    sheet.mergeCells('A1:H1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'SARTORIAL PRESTIGE — REPORTE GENERAL DE VENTAS';
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF131A26' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    // Encabezados de columnas
    sheet.getRow(3).values = [
      'N° Comprobante',
      'Fecha',
      'Cliente',
      'CI / NIT',
      'Canal de Venta',
      'Asesor / Vendedor',
      'Estado',
      'Total (Bs.)',
    ];
    sheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4AF37' } };
    sheet.getRow(3).height = 22;

    sheet.columns = [
      { key: 'codigo', width: 18 },
      { key: 'fecha', width: 22 },
      { key: 'cliente', width: 28 },
      { key: 'ciNit', width: 16 },
      { key: 'canal', width: 20 },
      { key: 'asesor', width: 26 },
      { key: 'estado', width: 15 },
      { key: 'total', width: 18 },
    ];

    let totalAcumulado = 0;
    ventas.forEach((v) => {
      const row = sheet.addRow({
        codigo: v.codigoComprobante,
        fecha: new Date(v.fecha).toLocaleString('es-BO'),
        cliente: v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido}` : 'Consumidor Final',
        ciNit: v.cliente?.ciNit || '0',
        canal: v.canal === 'ONLINE_WEB' ? 'Tienda Virtual' : 'Punto de Venta (POS)',
        asesor: v.usuario ? `${v.usuario.nombre} ${v.usuario.apellido}` : 'Online',
        estado: v.estado,
        total: Number(v.total),
      });
      totalAcumulado += Number(v.total);
      row.getCell(8).numFmt = '#,##0.00';
    });

    // Fila de Total
    const totalRow = sheet.addRow({
      codigo: 'TOTAL ACUMULADO',
      fecha: '',
      cliente: '',
      ciNit: '',
      canal: '',
      asesor: '',
      estado: '',
      total: totalAcumulado,
    });
    totalRow.font = { bold: true };
    totalRow.getCell(8).numFmt = '#,##0.00';

    const excelBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(excelBuffer);
  }

  // 4. EXPORTACIÓN DE CATÁLOGO / INVENTARIO A EXCEL
  async exportarInventarioExcel(): Promise<Buffer> {
    const productos = await this.productoRepo.find({
      relations: ['categoria', 'marca', 'proveedor'],
      order: { id: 'DESC' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sartorial Prestige System';
    const sheet = workbook.addWorksheet('Inventario & Catálogo');

    sheet.mergeCells('A1:J1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'SARTORIAL PRESTIGE — KARDEX DE INVENTARIO Y CONFECCIÓN';
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF131A26' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    sheet.getRow(3).values = [
      'SKU / Código',
      'Prenda / Modelo',
      'Categoría',
      'Firma / Marca',
      'Proveedor Textil',
      'Talla',
      'Tipo de Corte',
      'Paño / Tejido',
      'Stock Actual',
      'Precio Venta (Bs.)',
    ];
    sheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
    sheet.getRow(3).height = 22;

    sheet.columns = [
      { key: 'codigo', width: 16 },
      { key: 'nombre', width: 34 },
      { key: 'categoria', width: 22 },
      { key: 'marca', width: 20 },
      { key: 'proveedor', width: 26 },
      { key: 'talla', width: 12 },
      { key: 'corte', width: 16 },
      { key: 'material', width: 24 },
      { key: 'stock', width: 14 },
      { key: 'precio', width: 18 },
    ];

    productos.forEach((p) => {
      const row = sheet.addRow({
        codigo: p.codigo,
        nombre: p.nombre,
        categoria: p.categoria?.nombre || 'General',
        marca: p.marca?.nombre || 'Sartorial',
        proveedor: p.proveedor?.nombre || '-',
        talla: p.talla,
        corte: p.corte || 'Clásico',
        material: p.material || '-',
        stock: Number(p.stock),
        precio: Number(p.precioVenta),
      });
      row.getCell(10).numFmt = '#,##0.00';
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(excelBuffer);
  }

  // 5. ESTADÍSTICAS MENSUALES REALES PARA GRÁFICOS
  async obtenerEstadisticasMensuales(year: number = new Date().getFullYear()) {
    const rawData = await this.ventaRepo
      .createQueryBuilder('v')
      .select('EXTRACT(MONTH FROM v.fecha)', 'mes')
      .addSelect('SUM(v.total)', 'total')
      .addSelect('COUNT(v.id)', 'cantidad')
      .where('EXTRACT(YEAR FROM v.fecha) = :year', { year })
      .andWhere("v.estado != 'Cancelada'")
      .groupBy('EXTRACT(MONTH FROM v.fecha)')
      .orderBy('mes', 'ASC')
      .getRawMany();

    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const resultado = mesesNombres.map((nombre, idx) => {
      const mesNum = idx + 1;
      const found = rawData.find((r) => parseInt(r.mes, 10) === mesNum);
      return {
        mes: mesNum,
        nombre,
        total: found ? parseFloat(found.total) : 0,
        cantidad: found ? parseInt(found.cantidad, 10) : 0,
      };
    });

    return {
      year,
      labels: mesesNombres,
      totales: resultado.map((r) => r.total),
      cantidades: resultado.map((r) => r.cantidad),
      resumen: resultado,
    };
  }
}
