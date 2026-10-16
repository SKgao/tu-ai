import { IsInt, IsOptional, IsString } from 'class-validator';

/**
 * 关卡与小关卡共用该接口，靠 `partsId` / `textbookId` 区分：
 * - 关卡（passes 页）：传 `partsId` + `subject`，`id` 由服务端自增
 * - 小关卡（custom-passes 页）：传 `textbookId` + `tmpTitle`，且 `id` 由**客户端指定**
 */
export class CreatePassDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  tmpTitle?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  sort?: number;

  @IsOptional()
  @IsInt()
  partsId?: number;

  @IsOptional()
  @IsInt()
  textbookId?: number;

  @IsOptional()
  @IsInt()
  subject?: number;
}
