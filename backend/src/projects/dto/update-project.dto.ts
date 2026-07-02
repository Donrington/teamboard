import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { UpdateProjectPayload } from '@teamboard/shared';

/**
 * Every field optional (partial update). Written explicitly rather than via
 * PartialType to avoid pulling in an extra dependency for two fields.
 */
export class UpdateProjectDto implements UpdateProjectPayload {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
