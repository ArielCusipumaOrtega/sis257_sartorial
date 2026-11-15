import { PartialType } from '@nestjs/swagger';
import { CreateMedidaClienteDto } from './create-medida-cliente.dto';

export class UpdateMedidaClienteDto extends PartialType(CreateMedidaClienteDto) {}
