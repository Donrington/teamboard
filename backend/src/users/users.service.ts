import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from './schemas/user.schema';

interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
}

interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string;
}

/**
 * Owns all reads/writes to the `users` collection. AuthModule depends on this
 * service rather than touching the model directly — the seam that would later
 * become a network call to a standalone UserService (docs/00 · §5).
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  create(input: CreateUserInput): Promise<UserDocument> {
    return this.userModel.create({ ...input, email: input.email.toLowerCase() });
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  /** Email is intentionally not accepted here — it is not user-editable. */
  async updateProfile(id: string, input: UpdateProfileInput): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $set: input }, { new: true })
      .exec();
  }

  /** Confirms the account's current password — required before a destructive delete. */
  async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await this.userModel.findById(id).exec();
    if (!user) return false;
    return bcrypt.compare(password, user.passwordHash);
  }

  async deleteById(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
