import { IsInt, IsOptional, IsString } from 'class-validator';

/**
 * 更新素材。
 *
 * 刻意**不含 textbookId**：编辑态的教材下拉是禁用的，前端不会提交该字段。
 * 配合 main.ts 里全局 ValidationPipe 的 `whitelist: true`，即使请求里混入
 * textbookId 也会被剥掉，素材的所属教材不会被改写。
 */
export class UpdateSourceMaterialDto {
  @IsInt()
  id!: number;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  audio?: string;

  @IsOptional()
  @IsString()
  translation?: string;

  @IsOptional()
  @IsString()
  explainsArray?: string;
}
