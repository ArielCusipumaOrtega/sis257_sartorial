import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedidaCliente } from './entities/medida-cliente.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { MedidasClienteService } from './medidas-cliente.service';
import { MedidasClienteController } from './medidas-cliente.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedidaCliente, Cliente])],
  controllers: [MedidasClienteController],
  providers: [MedidasClienteService],
  exports: [MedidasClienteService],
})
export class MedidasClienteModule {}
