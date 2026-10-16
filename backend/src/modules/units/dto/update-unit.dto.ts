import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateUnitDto {
  @IsInt()
  id!: number;

  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsInt()
  textBookId!: number;

  @IsOptional()
  @IsInt()
  sort?: number;
}
