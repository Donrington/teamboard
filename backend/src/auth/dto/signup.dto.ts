import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import type { SignupPayload } from '@teamboard/shared';

/**
 * Validated signup body. `implements SignupPayload` ties it to the shared contract,
 * so the DTO and the frontend's request type can never disagree. The 72-char cap on
 * password matches bcrypt's byte limit.
 */
export class SignupDto implements SignupPayload {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
