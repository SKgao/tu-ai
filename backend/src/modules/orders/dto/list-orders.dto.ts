import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListOrdersDto {
  @IsOptional()
  @IsInt()
  tutuNumber?: number;

  @IsOptional()
  @IsString()
  orderNo?: string;

  @IsOptional()
  @IsInt()
  itemId?: number;

  @IsOptional()
  @IsInt()
  payType?: number;

  @IsOptional()
  @IsInt()
  orderStatus?: number;

  @IsOptional()
  @IsInt()
  activityId?: number;

  @IsOptional()
  @IsInt()
  textbookId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
