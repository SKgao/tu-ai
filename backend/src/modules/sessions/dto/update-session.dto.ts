import { CreateSessionDto } from './create-session.dto';

/** 编辑大关卡：字段集与新增完全一致（`textbookId` `id` `title` `icon` `sort`） */
export class UpdateSessionDto extends CreateSessionDto {}
