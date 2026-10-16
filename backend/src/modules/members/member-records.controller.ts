import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { normalizePrimitivePayload } from '../access/shared';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { ListLearningRecordsDto } from './dto/list-learning-records.dto';
import { ListInvitePayload, MemberRecordsService } from './member-records.service';

@Controller()
@UseGuards(TokenAuthGuard)
export class MemberRecordsController {
  constructor(private readonly memberRecordsService: MemberRecordsService) {}

  /**
   * ⚠️ 请求体是**裸数字**（图图号），不是对象：
   * `http.post('member/invite/list', userId)` —— services/invite-count.ts:4。
   * 与 `book/delete` 同样用 `normalizePrimitivePayload` 归一成 `{ userId }`。
   */
  @Post('member/invite/list')
  listInvites(@Body() payload: unknown) {
    const normalized = normalizePrimitivePayload<ListInvitePayload>(payload, 'userId');
    return this.memberRecordsService.listInvites(normalized);
  }

  @Post('member/pass/record')
  listLearningRecords(@Body() payload: ListLearningRecordsDto) {
    return this.memberRecordsService.listLearningRecords(payload);
  }
}
