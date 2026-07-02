import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { UserPublic } from '@teamboard/shared';

import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProjectsService } from '../projects/projects.service';

/**
 * Self-service profile management, separate from AuthModule (which only owns
 * identity/credentials) — this is "what a signed-in user can do to their own
 * record" (name, avatar, account deletion), never their email or password hash.
 *
 *   PATCH  /api/users/me   { name?, avatarUrl? } -> updated user
 *   DELETE /api/users/me   { password }          -> 204, cascades their data
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Patch('me')
  async updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserPublic> {
    const updated = await this.usersService.updateProfile(userId, dto);
    if (!updated) {
      throw new NotFoundException('User not found.');
    }
    return updated.toJSON() as unknown as UserPublic;
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(
    @CurrentUser('id') userId: string,
    @Body() dto: DeleteAccountDto,
  ): Promise<void> {
    const passwordOk = await this.usersService.verifyPassword(userId, dto.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Incorrect password.');
    }
    // Cascade the user's own data before removing the account itself.
    await this.projectsService.removeAllForOwner(userId);
    await this.usersService.deleteById(userId);
  }
}
