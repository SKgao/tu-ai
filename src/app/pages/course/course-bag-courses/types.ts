import type { ApiEntityList } from '@/app/lib/http';

export type CourseBagCourseRecord = {
  id: number | string;
  bagId?: number | string;
  name?: string;
  icon?: string;
  sort?: number | string;
  status?: number | string;
  createdAt?: string;
  updatedAt?: string;
} & Record<string, unknown>;

/**
 * 本页不请求独立的课程分页接口，课程来自课程包详情里的 `textBookDOS`，
 * 只按课程包 ID 定位；这里保留可选查询字段，方便后续接入分页和筛选。
 */
export type CourseBagCourseQuery = {
  bagId?: string;
} & Record<string, unknown>;

/**
 * 课程列表是裸数组（来自课程包的 `textBookDOS` 字段），不是 { data, totalCount } 结构。
 */
export type CourseBagCourseListResult = ApiEntityList<CourseBagCourseRecord>;

export type CourseBagCourseFormValues = {
  id?: number;
  name: string;
  icon?: string;
  sort?: number;
};
