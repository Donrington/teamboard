import { IsNotEmpty, IsString } from 'class-validator';
import type { DeleteAccountPayload } from '@teamboard/shared';

/** Re-entering the password is the confirmation gate for this destructive action. */
export class DeleteAccountDto implements DeleteAccountPayload {
  @IsString()
  @IsNotEmpty()
  password!: string;
}
