import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSubjectDto {
  @IsInt()
  customsPassId!: number;

  /** 上下文透传字段（来自 URL），schema 里是普通可空 Int，无 relation。 */
  @IsOptional()
  @IsInt()
  partId?: number;

  /** 上下文透传字段（来自 URL），schema 里是普通可空 Int，无 relation。 */
  @IsOptional()
  @IsInt()
  sessionId?: number;

  @IsString()
  sourceIds!: string;

  @IsOptional()
  @IsInt()
  sort?: number;

  /** 前端把表单里的字符串按空白切分成 string[]，落库时按约定 join(' ')。 */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  showIndex?: string[];

  @IsOptional()
  @IsInt()
  subject?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  audio?: string;

  @IsOptional()
  @IsString()
  sentenceAudio?: string;

  @IsOptional()
  @IsString()
  sceneGraph?: string;
}
