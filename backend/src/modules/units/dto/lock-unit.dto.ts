import { IsInt } from 'class-validator';

/** 锁定参数通过 query 传递：?unitId=1&canLock=2 */
export class LockUnitDto {
  @IsInt()
  unitId!: number;

  @IsInt()
  canLock!: number;
}
