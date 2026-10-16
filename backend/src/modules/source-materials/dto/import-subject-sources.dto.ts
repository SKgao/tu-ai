import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

/**
 * 题目-素材导入。
 *
 * 三个数组传的是**文件名**（前端用 getImportFileNames 取 name），不是 URL。
 * 接口返回 HTML 字符串，由前端 dangerouslySetInnerHTML 渲染。
 */
export class ImportSubjectSourcesDto {
  /** 指向 Course.textbookId */
  @IsInt()
  textbookId!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  audioArray?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageArray?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sentensArray?: string[];
}
