// src/auth/strategies/jwt-player.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtPlayerStrategy extends PassportStrategy(
  Strategy,
  'player-jwt', // <-- nom de la stratégie
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // <--- joueur utilise Authorization: Bearer XXX
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: any) {
    // payload = { playerId, roomId, pseudo }
    return payload;
  }
}
