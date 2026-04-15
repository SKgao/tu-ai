import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListCourseUsersDto {
  @IsOptional()
  @IsInt()
  textbookId?: number;

  @IsOptional()
  @IsInt()
  tutuNumber?: number;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  realName?: string;

  @IsOptional()
  @IsInt()
  sex?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
