import { IsInt, Min } from 'class-validator';

export class UserIdDto {
  @IsInt()
  @Min(1)
  id!: number;
}
