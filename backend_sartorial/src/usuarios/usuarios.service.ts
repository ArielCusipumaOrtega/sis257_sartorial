import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const existing = await this.usuarioRepository.findOne({
      where: [{ usuario: createUsuarioDto.usuario }, { correo: createUsuarioDto.correo }],
    });
    if (existing) {
      throw new BadRequestException('El usuario o correo electrónico ya existe');
    }

    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);
    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
    });
    return this.usuarioRepository.save(usuario);
  }

  findAll(conInactivos: boolean = false) {
    return this.usuarioRepository.find({
      relations: ['rol'],
      select: ['id', 'nombre', 'apellido', 'correo', 'usuario', 'estado', 'fechaCreacion', 'rolId'],
      withDeleted: conInactivos,
    });
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['rol'],
    });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);
    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    } else {
      delete updateUsuarioDto.password;
    }
    Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    usuario.estado = false;
    await this.usuarioRepository.save(usuario);
    return this.usuarioRepository.softRemove(usuario);
  }

  async restore(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    await this.usuarioRepository.restore(id);
    usuario.estado = true;
    return this.usuarioRepository.save(usuario);
  }
}
