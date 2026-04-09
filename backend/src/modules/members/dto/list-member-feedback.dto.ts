import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListMemberFeedbackDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  pageNum?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  tutuNumber?: number;

  @IsOptional()
  @IsString()
  mobile?: string;
}
