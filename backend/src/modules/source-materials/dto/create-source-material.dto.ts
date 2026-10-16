import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSourceMaterialDto {
  /** 指向 Course.textbookId（Course 的主键就叫 textbookId，不是 id）。 */
  @IsInt()
  textbookId!: number;

  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  audio?: string;

  /** 单次释义 */
  @IsOptional()
  @IsString()
  translation?: string;

  /** 多次释义（接口层是字符串） */
  @IsOptional()
  @IsString()
  explainsArray?: string;
}
