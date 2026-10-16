import { IsInt } from 'class-validator';

/** 启停参数通过 query 传递：?id=1&status=2（1=启用，2=禁用） */
export class ChangeSessionStatusDto {
  @IsInt()
  id!: number;

  @IsInt()
  status!: number;
}
