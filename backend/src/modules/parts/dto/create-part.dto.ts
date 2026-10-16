import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePartDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  tips?: string;

  @IsInt()
  unitsId!: number;

  @IsOptional()
  @IsInt()
  sort?: number;
}
