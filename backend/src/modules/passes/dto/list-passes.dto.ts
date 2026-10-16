import { IsInt, IsOptional, Min } from 'class-validator';

/**
 * `pass/list/:id` 的筛选维度由 query 决定（用户已拍板的方案）：
 * - query 带 `partsId`  → 按 Part 过滤（关卡页）
 * - query 带 `textbookId` → 按教材过滤（小关卡页 / 大关卡页）
 * 两者都没有时后端会明确报错，而不是猜一个维度返回可能错误的数据。
 */
export class ListPassesDto {
  @IsOptional()
  @IsInt()
  partsId?: number;

  @IsOptional()
  @IsInt()
  textbookId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
