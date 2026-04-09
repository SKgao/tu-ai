import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsInt()
  gradeId!: number;

  @IsInt()
  bookVersionId!: number;
}
