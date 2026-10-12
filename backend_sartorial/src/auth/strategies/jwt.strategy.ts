import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'sartorial_prestige_secret_key_sis257_2024',
    });
  }

  async validate(payload: any) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: payload.sub },
      relations: ['rol'],
    });
    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException('Usuario no válido o inactivo');
    }
    return usuario;
  }
}
