import { IsInt, IsOptional, IsString } from 'class-validator';

export class CourseBagCourseMutationDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsInt()
  bagId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  sort?: number;

  @IsOptional()
  @IsInt()
  status?: number;
}
