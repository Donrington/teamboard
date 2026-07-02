import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtClaims } from '@teamboard/shared';

import { AuthUser } from '../../common/decorators/current-user.decorator';

/**
 * Passport JWT strategy. Reads a `Bearer <token>` header, verifies the signature and
 * expiry against `JWT_SECRET`, and returns the principal that becomes `req.user`.
 * The token carries *identity*; guards decide *authority* (docs/00 · ADR-003).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('jwt.secret'),
    });
  }

  validate(payload: JwtClaims): AuthUser {
    return { id: payload.sub, email: payload.email };
  }
}
