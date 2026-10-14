import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Auditoría')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener bitácora de auditoría (Exclusivo ADMIN)' })
  findAll(
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Query('tabla') tabla?: string,
    @Query('accion') accion?: string,
  ) {
    return this.auditoriaService.findAll(+limit || 50, +offset || 0, tabla, accion);
  }
}
