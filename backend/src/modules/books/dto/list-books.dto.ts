import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListBooksDto {
  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  gradeId?: number;

  @IsOptional()
  @IsInt()
  bookVersionId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
