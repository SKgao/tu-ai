import type { ApiEntityList } from '@/app/lib/http';

export type CourseBagRecord = {
  id: number | string;
  title?: string;
  icon?: string;
  sort?: number | string;
  status?: number | string;
  textBookDOS?: unknown[];
} & Record<string, unknown>;

/**
 * `bag/list` 当前不接收查询参数，这里保留可选的查询字段，方便后续接入筛选。
 */
export type CourseBagQuery = {
  pageNum?: number;
  pageSize?: number;
} & Record<string, unknown>;

/**
 * `bag/list` 返回的是裸数组（ApiEntityList），不是 { data, totalCount } 结构。
 */
export type CourseBagListResult = ApiEntityList<CourseBagRecord>;

export type CourseBagFormValues = {
  id?: number;
  title: string;
  icon?: string;
  sort?: number;
};
