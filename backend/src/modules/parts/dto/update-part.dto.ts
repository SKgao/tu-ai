import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePartDto {
  @IsInt()
  id!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  tips?: string;

  @IsOptional()
  @IsInt()
  unitsId?: number;

  @IsOptional()
  @IsInt()
  sort?: number;

  @IsOptional()
  @IsInt()
  canLock?: number;
}
