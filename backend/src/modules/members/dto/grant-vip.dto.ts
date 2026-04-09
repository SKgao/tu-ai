import { IsInt, Min } from 'class-validator';

export class GrantVipDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsInt()
  @Min(0)
  userLevel!: number;
}
