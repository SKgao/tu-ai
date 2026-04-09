import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMemberLevelDto {
  @IsInt()
  @Min(0)
  userLevel!: number;

  @IsString()
  @IsNotEmpty()
  levelName!: string;

  @IsOptional()
  @IsString()
  explainInfo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  exprieDays?: number | null;

  @IsOptional()
  @IsNumber()
  orgMoney?: number | null;

  @IsOptional()
  @IsNumber()
  needMoney?: number | null;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateMemberLevelDto {
  @IsInt()
  @Min(0)
  userLevel!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  levelName?: string;

  @IsOptional()
  @IsString()
  explainInfo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  exprieDays?: number | null;

  @IsOptional()
  @IsNumber()
  orgMoney?: number | null;

  @IsOptional()
  @IsNumber()
  needMoney?: number | null;

  @IsOptional()
  @IsString()
  icon?: string;
}
