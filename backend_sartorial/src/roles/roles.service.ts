import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  create(createRolDto: CreateRolDto) {
    const rol = this.rolRepository.create(createRolDto);
    return this.rolRepository.save(rol);
  }

  findAll(conInactivos: boolean = false) {
    return this.rolRepository.find({
      withDeleted: conInactivos,
    });
  }

  async findOne(id: number) {
    const rol = await this.rolRepository.findOne({ where: { id } });
    if (!rol) throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    return rol;
  }

  async update(id: number, updateRolDto: UpdateRolDto) {
    const rol = await this.findOne(id);
    Object.assign(rol, updateRolDto);
    return this.rolRepository.save(rol);
  }

  async remove(id: number) {
    const rol = await this.findOne(id);
    return this.rolRepository.softRemove(rol);
  }

  async restore(id: number) {
    const rol = await this.rolRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!rol) throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    await this.rolRepository.restore(id);
    return this.rolRepository.save(rol);
  }
}
