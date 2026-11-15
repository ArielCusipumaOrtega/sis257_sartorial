import {
  Controller,
  Get,
  Param,
  Res,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocumentosService } from './documentos.service';

@ApiTags('Documentos & Reportes (PDF / Excel)')
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Get('ticket/:ventaId')
  @ApiOperation({ summary: 'Generar ticket térmico (80mm) en PDF con Código QR' })
  async descargarTicket(
    @Param('ventaId', ParseIntPipe) ventaId: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.documentosService.generarTicketTermico(ventaId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Ticket_Sartorial_${ventaId}.pdf"`,
    );
    res.send(pdfBuffer);
  }

  @Get('factura/:ventaId')
  @ApiOperation({ summary: 'Generar factura / recibo formal A4 en PDF' })
  async descargarFactura(
    @Param('ventaId', ParseIntPipe) ventaId: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.documentosService.generarFacturaA4(ventaId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Factura_Sartorial_${ventaId}.pdf"`,
    );
    res.send(pdfBuffer);
  }

  @Get('ventas/excel')
  @ApiOperation({ summary: 'Exportar histórico de ventas a Excel (.xlsx)' })
  async exportarVentasExcel(@Res() res: Response) {
    const buffer = await this.documentosService.exportarVentasExcel();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Ventas_Sartorial_Prestige.xlsx"',
    );
    res.send(buffer);
  }

  @Get('inventario/excel')
  @ApiOperation({ summary: 'Exportar catálogo e inventario actual a Excel (.xlsx)' })
  async exportarInventarioExcel(@Res() res: Response) {
    const buffer = await this.documentosService.exportarInventarioExcel();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Inventario_Sartorial_Prestige.xlsx"',
    );
    res.send(buffer);
  }

  @Get('estadisticas-mensuales')
  @ApiOperation({ summary: 'Obtener totales de ventas por mes calculados desde la base de datos' })
  obtenerEstadisticasMensuales(@Query('year') year?: string) {
    return this.documentosService.obtenerEstadisticasMensuales(year ? +year : undefined);
  }
}
