import { IsInt, IsOptional } from 'class-validator';

/**
 * 小关卡页的删除走 query：`pass/delete?id=1&textbookId=2`
 * （关卡页走路径：`pass/delete/:id`）。两种形态都必须支持。
 */
export class DeletePassDto {
  @IsInt()
  id!: number;

  /** 仅用于兼容前端既有调用；记录本身由 id 唯一确定 */
  @IsOptional()
  @IsInt()
  textbookId?: number;
}
