import { IsInt } from 'class-validator';

/** 已绑定小关卡列表，参数通过 query 传递：?textbookId=1&sessionId=2 */
export class ListSessionCustomPassesDto {
  @IsInt()
  textbookId!: number;

  @IsInt()
  sessionId!: number;
}
