import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListSourceMaterialsDto {
  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  text?: string;

  /**
   * 模糊/精确开关，语义反直觉：`''`（默认）= 模糊，`1` = 精确。
   *
   * 前端的 compactPayload 会剔除空串，所以**模糊搜索时该字段根本不发送**，
   * 缺省必须按「模糊」处理，不能望文生义地认为「不传 = 精确」。
   */
  @IsOptional()
  @IsIn(['', 1, '1', 0, '0'])
  openLike?: string | number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;

  // 注意：这里刻意没有 textbookId —— 素材是跨教材的全局库，列表不做教材筛选。
}
