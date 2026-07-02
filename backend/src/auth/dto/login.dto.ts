import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import type { LoginPayload } from '@teamboard/shared';

export class LoginDto implements LoginPayload {
  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password!: string;
}
