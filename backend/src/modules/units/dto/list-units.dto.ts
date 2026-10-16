import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListUnitsDto {
  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  textBookId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
