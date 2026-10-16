import { IsInt } from 'class-validator';

/** 绑定小关卡，参数通过 query 传递：?textbookId=1&sessionId=2&customPassId=3 */
export class BindSessionCustomPassDto {
  @IsInt()
  textbookId!: number;

  @IsInt()
  sessionId!: number;

  @IsInt()
  customPassId!: number;
}
