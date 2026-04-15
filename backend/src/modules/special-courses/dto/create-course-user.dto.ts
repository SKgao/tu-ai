import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCourseUserDto {
  @IsOptional()
  @IsString()
  realName?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsInt()
  sex?: number;

  @IsOptional()
  @IsInt()
  payAmt?: number;

  @IsOptional()
  @IsInt()
  textbookId?: number;
}
