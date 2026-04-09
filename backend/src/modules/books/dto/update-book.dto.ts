import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateBookDto {
  @IsInt()
  id!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsInt()
  gradeId!: number;

  @IsInt()
  bookVersionId!: number;

  @IsOptional()
  @IsInt()
  status?: number;
}
