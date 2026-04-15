import { IsInt, IsOptional, IsString } from 'class-validator';

export class SpecialCourseMutationDto {
  @IsOptional()
  @IsInt()
  textbookId?: number;

  @IsOptional()
  @IsString()
  textbookName?: string;

  @IsOptional()
  @IsString()
  teacher?: string;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsInt()
  type?: number;

  @IsOptional()
  @IsString()
  saleBeginAt?: string;

  @IsOptional()
  @IsString()
  saleEndAt?: string;

  @IsOptional()
  @IsString()
  beginAt?: string;

  @IsOptional()
  @IsString()
  endAt?: string;

  @IsOptional()
  @IsInt()
  orgAmt?: number;

  @IsOptional()
  @IsInt()
  amt?: number;

  @IsOptional()
  @IsInt()
  num?: number;

  @IsOptional()
  @IsString()
  chatNo?: string;

  @IsOptional()
  @IsString()
  iconDetail?: string;

  @IsOptional()
  @IsString()
  iconTicket?: string;
}
