import { IsInt, IsOptional, IsString } from 'class-validator';

/** 场景图参数走 query：`?id=1&scenePic=<url>`。 */
export class ScenePicDto {
  @IsInt()
  id!: number;

  @IsOptional()
  @IsString()
  scenePic?: string;
}
