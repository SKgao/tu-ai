import { IsInt } from 'class-validator';

export class ChangeActivityStatusDto {
  @IsInt()
  id!: number;

  @IsInt()
  status!: number;
}
