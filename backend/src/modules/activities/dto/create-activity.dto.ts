import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  activeMoney?: number;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsInt()
  activityType?: number;

  @IsOptional()
  @IsInt()
  itemId?: number;

  @IsOptional()
  @IsInt()
  activeExpireDays?: number;

  @IsString()
  beginAt!: string;

  @IsString()
  endAt!: string;

  @IsOptional()
  @IsString()
  url?: string;
}
