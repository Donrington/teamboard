import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';

import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Wires auth together: UsersModule (data), PassportModule + JwtModule (tokens).
 * JWT config is resolved asynchronously from validated env (secret + expiry).
 * Exports AuthService so other modules could reuse it if needed.
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // Joi validates JWT_SECRET/JWT_EXPIRES_IN as required at boot (env.validation.ts),
        // so getOrThrow documents that guarantee instead of typing these as optional.
        // JWT_EXPIRES_IN is an ms-style duration string (e.g. "7d") by our own
        // .env.example convention — StringValue is jsonwebtoken's exact expected shape.
        secret: config.getOrThrow<string>('jwt.secret'),
        signOptions: { expiresIn: config.getOrThrow<string>('jwt.expiresIn') as StringValue },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
