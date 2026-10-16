import { IsInt, IsOptional, IsString } from 'class-validator';

/**
 * 编辑提交的字段集与新增**不同**：前端只提交
 * `id` / `customsPassId` / `customsPassName` / `sourceIds` / `sort`。
 * `icon` / `audio` / `sentenceAudio` / `subject` / `showIndex` / `sceneGraph`
 * 都不走这个接口（场景图另有 upload/pic、upload/pic/update、del/pic 三个接口）。
 */
export class UpdateSubjectDto {
  @IsInt()
  id!: number;

  @IsOptional()
  @IsInt()
  customsPassId?: number;

  /** 展示别名（来自 `Pass.title`），不落库，见 service 说明。 */
  @IsOptional()
  @IsString()
  customsPassName?: string;

  @IsOptional()
  @IsString()
  sourceIds?: string;

  @IsOptional()
  @IsInt()
  sort?: number;
}
