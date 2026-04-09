import { IsInt } from 'class-validator';

export class BookIdDto {
  @IsInt()
  id!: number;
}
