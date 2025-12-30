import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class PlayerAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');

    const [type, token] = authHeader.split(' ');


    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization format');
    }

    try {
      // 👉 Vérifie le player_token

    console.log("hello : " + token)
      const payload = this.authService.verifyPlayerToken(token);

      // 👉 Adapte EXACTEMENT à ton payload :
      req.user = {
        playerId: payload.playerId,
        roomId: payload.roomId,
        pseudo: payload.pseudo,
      };

      return true;

    } catch (err) {
      throw new UnauthorizedException('Invalid player token');
    }
  }
}
