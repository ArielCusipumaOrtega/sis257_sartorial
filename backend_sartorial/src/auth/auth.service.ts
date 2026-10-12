import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Rol } from '../roles/entities/rol.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { usuario, clave } = loginDto;
    const user = await this.usuarioRepository.findOne({
      where: { usuario },
      relations: ['rol'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.estado) {
      throw new UnauthorizedException('Usuario inactivo. Contacte al administrador.');
    }

    const passwordValid = await bcrypt.compare(clave, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: user.id,
      usuario: user.usuario,
      correo: user.correo,
      rol: user.rol?.nombre,
    };

    return {
      access_token: this.jwtService.sign(payload),
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      usuario: user.usuario,
      correo: user.correo,
      rol: user.rol,
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usuarioRepository.findOne({
      where: [{ usuario: registerDto.usuario }, { correo: registerDto.correo }],
    });
    if (existing) {
      throw new BadRequestException('El nombre de usuario o correo ya está registrado');
    }

    let rolCliente = await this.rolRepository.findOne({ where: { nombre: 'CLIENTE' } });
    if (!rolCliente) {
      rolCliente = await this.rolRepository.save(
        this.rolRepository.create({ nombre: 'CLIENTE', descripcion: 'Cliente de boutique' }),
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const nuevoUsuario = this.usuarioRepository.create({
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      correo: registerDto.correo,
      usuario: registerDto.usuario,
      password: hashedPassword,
      estado: true,
      rolId: rolCliente.id,
    });
    const savedUser = await this.usuarioRepository.save(nuevoUsuario);

    // Crear perfil de cliente automático
    const nuevoCliente = this.clienteRepository.create({
      nombre: registerDto.nombre,
      apellido: registerDto.apellido,
      correo: registerDto.correo,
      estado: true,
      preferenciaTalla: 'M (40)',
    });
    await this.clienteRepository.save(nuevoCliente);

    return this.login({ usuario: registerDto.usuario, clave: registerDto.password });
  }

  async getProfile(userId: number) {
    return this.usuarioRepository.findOne({
      where: { id: userId },
      relations: ['rol'],
      select: ['id', 'nombre', 'apellido', 'correo', 'usuario', 'estado', 'fechaCreacion'],
    });
  }
}
