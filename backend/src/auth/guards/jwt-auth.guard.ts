import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protects a route: requires a valid JWT (via JwtStrategy) or responds 401.
 * Apply with `@UseGuards(JwtAuthGuard)` on a controller or handler.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
