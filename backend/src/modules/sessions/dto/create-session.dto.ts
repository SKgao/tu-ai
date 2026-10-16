import { IsInt, IsOptional, IsString } from 'class-validator';

/** 新增大关卡：`id` 由客户端提交（Prisma 模型 `Session.id` 非自增） */
export class CreateSessionDto {
  @IsInt()
  id!: number;

  @IsInt()
  textbookId!: number;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  sort?: number;
}
