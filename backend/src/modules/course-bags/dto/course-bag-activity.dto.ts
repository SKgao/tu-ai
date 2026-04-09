import { IsInt, IsOptional, IsString } from 'class-validator';

export class CourseBagActivityMutationDto {
  @IsInt()
  id!: number;

  @IsOptional()
  @IsInt()
  textbookId?: number;

  @IsOptional()
  @IsString()
  textbookName?: string;

  @IsString()
  teacher!: string;

  @IsInt()
  status!: number;

  @IsInt()
  type!: number;

  @IsString()
  saleBeginAt!: string;

  @IsString()
  saleEndAt!: string;

  @IsOptional()
  @IsString()
  beginAt?: string;

  @IsOptional()
  @IsString()
  endAt?: string;

  @IsInt()
  orgAmt!: number;

  @IsInt()
  amt!: number;

  @IsInt()
  num!: number;

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
