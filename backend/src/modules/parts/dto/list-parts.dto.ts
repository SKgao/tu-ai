import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListPartsDto {
  /** 列表筛选参数名是 unitId（注意与记录字段 unitsId 不同名） */
  @IsOptional()
  @IsInt()
  unitId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;
}
