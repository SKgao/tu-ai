import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

function transformNumberArray(value: unknown): number[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];
  return values
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}

export class ListMembersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @Transform(({ value }) => transformNumberArray(value))
  @IsArray()
  @IsInt({ each: true })
  userLevelIds?: number[];

  @IsOptional()
  @IsString()
  expireStartTime?: string;

  @IsOptional()
  @IsString()
  expireEndTime?: string;

  @IsOptional()
  @IsString()
  payStartTime?: string;

  @IsOptional()
  @IsString()
  payEndTime?: string;

  @IsOptional()
  @IsString()
  registerStartTime?: string;

  @IsOptional()
  @IsString()
  registerEndTime?: string;

  @IsOptional()
  @IsInt()
  tutuNumber?: number;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsInt()
  sex?: number;

  @IsOptional()
  @IsInt()
  hasSetPassword?: number;

  @IsOptional()
  @IsInt()
  sortInvite?: number;

  @IsOptional()
  @IsInt()
  sortUserId?: number;
}
