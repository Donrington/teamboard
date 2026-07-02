import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

/**
 * User collection. We store a bcrypt `passwordHash` — never a plaintext password
 * (docs/00 · ADR-003). The `toJSON` transform below guarantees the hash can never
 * leak out of the API, even if a service accidentally returns a raw document.
 */
@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, trim: true, maxlength: 80 })
  name!: string;

  @Prop({ trim: true, maxlength: 2048 })
  avatarUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Serialise `_id` -> `id`, drop `__v`, and ALWAYS strip the password hash.
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    r.id = String(r._id);
    delete r._id;
    delete r.passwordHash;
    return r;
  },
});
