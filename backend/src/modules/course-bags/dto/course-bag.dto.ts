import { IsInt, IsOptional, IsString } from 'class-validator';

export class CourseBagMutationDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  title?: string;

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
