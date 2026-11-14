import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Si no hay usuario o el token es inválido/inexistente, no falla la petición,
    // retorna null para permitir identificar ventas anónimas o autenticadas.
    return user || null;
  }
}
