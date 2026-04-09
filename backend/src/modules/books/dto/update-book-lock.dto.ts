import { IsInt } from 'class-validator';

export class UpdateBookLockDto {
  @IsInt()
  textbookId!: number;

  @IsInt()
  canLock!: number;
}
