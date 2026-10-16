import { IsInt, IsOptional, Min } from 'class-validator';

export class ListLearningRecordsDto {
  /** ⚠️ 传的是 tutuNumber（图图号），不是 Member.id。 */
  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
