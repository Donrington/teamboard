import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { CreateProjectPayload } from '@teamboard/shared';

export class CreateProjectDto implements CreateProjectPayload {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
