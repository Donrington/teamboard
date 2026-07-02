import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { AuthResponse, JwtClaims, UserPublic } from '@teamboard/shared';

import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 10;

/**
 * All authentication business logic (docs/00 · ADR-003, ADR-005). The controller
 * stays thin; hashing, credential checks, and token issuance all live here.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    // One generic message whether the email is unknown or the password is wrong —
    // never reveal which accounts exist.
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    return this.buildAuthResponse(user);
  }

  async me(userId: string): Promise<UserPublic> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user.toJSON() as unknown as UserPublic;
  }

  private buildAuthResponse(user: UserDocument): AuthResponse {
    const claims: JwtClaims = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(claims);
    return { accessToken, user: user.toJSON() as unknown as UserPublic };
  }
}
