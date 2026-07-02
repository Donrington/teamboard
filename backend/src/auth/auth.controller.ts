import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthResponse, UserPublic } from '@teamboard/shared';

import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * Thin auth controller (docs/00 · ADR-005): parse + validate via DTOs, delegate to
 * the service, return the result. No business logic here.
 *
 *   POST /api/auth/signup   -> 201 { accessToken, user }
 *   POST /api/auth/login    -> 200 { accessToken, user }
 *   GET  /api/auth/me       -> 200 user            (requires Bearer token)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: SignupDto): Promise<AuthResponse> {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser('id') userId: string): Promise<UserPublic> {
    return this.authService.me(userId);
  }
}
