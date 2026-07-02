import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import type { UpdateProfilePayload } from '@teamboard/shared';

/**
 * Profile self-service update. Deliberately has no `email` field — changing the
 * account's email is out of scope by design, not an oversight.
 */
export class UpdateProfileDto implements UpdateProfilePayload {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  avatarUrl?: string;
}
