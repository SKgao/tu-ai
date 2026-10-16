import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePassDto {
  @IsInt()
  id!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  tmpTitle?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  sort?: number;

  @IsOptional()
  @IsInt()
  partsId?: number;

  @IsOptional()
  @IsInt()
  textbookId?: number;

  @IsOptional()
  @IsInt()
  subject?: number;
}
