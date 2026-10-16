import { IsInt } from 'class-validator';

/** 调整绑定顺序，参数通过 query 传递：?id=绑定行 id&sort=3 */
export class ChangeSessionCustomSortDto {
  @IsInt()
  id!: number;

  @IsInt()
  sort!: number;
}
