import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';

/**
 * Unit tests for AuthService with UsersService and JwtService mocked — no database,
 * no network. Covers the signup happy path, the duplicate-email case, and login
 * success/failure (docs/08).
 */
describe('AuthService', () => {
  let service: AuthService;
  let users: { findByEmail: jest.Mock; create: jest.Mock; findById: jest.Mock };
  let jwt: { sign: jest.Mock };

  const fakeUser = (over: Record<string, unknown> = {}) => ({
    id: 'user-1',
    email: 'ada@teamboard.dev',
    name: 'Ada',
    passwordHash: 'hash',
    toJSON() {
      return { id: 'user-1', email: 'ada@teamboard.dev', name: 'Ada' };
    },
    ...over,
  });

  beforeEach(async () => {
    users = { findByEmail: jest.fn(), create: jest.fn(), findById: jest.fn() };
    jwt = { sign: jest.fn().mockReturnValue('signed.jwt.token') };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('signup', () => {
    it('hashes the password, creates the user, and returns a token without the hash', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockResolvedValue(fakeUser());

      const res = await service.signup({
        name: 'Ada',
        email: 'ada@teamboard.dev',
        password: 'password123',
      });

      const createdArg = users.create.mock.calls[0][0];
      expect(createdArg.passwordHash).not.toBe('password123');
      expect(await bcrypt.compare('password123', createdArg.passwordHash)).toBe(true);
      expect(res.accessToken).toBe('signed.jwt.token');
      expect(res.user).not.toHaveProperty('passwordHash');
    });

    it('rejects a duplicate email with 409 and never creates a user', async () => {
      users.findByEmail.mockResolvedValue(fakeUser());

      await expect(
        service.signup({ name: 'Ada', email: 'ada@teamboard.dev', password: 'password123' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(users.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns a token for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      users.findByEmail.mockResolvedValue(fakeUser({ passwordHash }));

      const res = await service.login({ email: 'ada@teamboard.dev', password: 'password123' });
      expect(res.accessToken).toBe('signed.jwt.token');
    });

    it('throws 401 for a wrong password', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      users.findByEmail.mockResolvedValue(fakeUser({ passwordHash }));

      await expect(
        service.login({ email: 'ada@teamboard.dev', password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws 401 (not 404) for an unknown email', async () => {
      users.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@teamboard.dev', password: 'whatever12' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
