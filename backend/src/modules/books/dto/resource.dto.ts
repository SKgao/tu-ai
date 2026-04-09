import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateGradeDto {
  @IsInt()
  id!: number;

  @IsString()
  gradeName!: string;

  @IsOptional()
  @IsInt()
  status?: number;
}

export class UpdateBookVersionDto {
  @IsInt()
  id!: number;

  @IsString()
  name!: string;
}
