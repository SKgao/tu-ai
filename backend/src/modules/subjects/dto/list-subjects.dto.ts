import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListSubjectsDto {
  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  /** 前端传的是字符串（`buildSubjectSearchFilters` 返回 string），后端自行转数字。 */
  @IsOptional()
  @IsString()
  customsPassId?: string;

  /** 关卡名称，跨表过滤 `Pass.title`。 */
  @IsOptional()
  @IsString()
  customsPassName?: string;

  @IsOptional()
  @IsString()
  sourceIds?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
