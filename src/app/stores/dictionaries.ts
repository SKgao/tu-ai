import type { ApiEntity } from '@/app/lib/http';
import { listCourseBags } from '@/app/services/course-bags';
import { listRoles } from '@/app/services/roles';
import { listSubjects } from '@/app/services/subjects';
import { listBooks } from '@/app/services/units';
import { createDictionaryStore, type DictionaryOption } from './dictionary';

/**
 * 全站共享的「字典」缓存。
 *
 * 这些接口原本被多个页面各自 mount 全量拉取：
 *  - 教材      → units / source-material / special-courses（3 处重复）
 *  - 题型      → subjects / passes / custom-passes（3 处重复）
 *  - 课程包    → course-bag-courses / course-bag-activities（2 处重复）
 *  - 角色      → users（角色下拉；roles 页是 CRUD 拥有者）
 *
 * 注意：课程包/角色/教材的 **CRUD 拥有者页面**仍然直接用分页接口取自己的表格数据，
 * 它们只负责在写操作成功后调用对应的 `invalidate()`。
 */

/** 教材字典：`{ id, name }` 形状（units / source-material / special-courses 共用） */
export const useBookDictionary = createDictionaryStore<DictionaryOption>({
  label: '教材列表',
  fetcher: async () => {
    const result = await listBooks({ pageNum: 1, pageSize: 1000 });
    return Array.isArray(result?.data) ? (result.data as DictionaryOption[]) : [];
  },
});

/** 题型字典：`pass/subject`，返回 `{ id, name }` 形状 */
export const useSubjectTypeDictionary = createDictionaryStore<DictionaryOption>({
  label: '题型列表',
  fetcher: async () => {
    const items = await listSubjects();
    return Array.isArray(items) ? (items as DictionaryOption[]) : [];
  },
});

/**
 * 课程包字典：返回原始课程包记录。
 * 各页面用法不同（course-bag-courses 按 bagId 取嵌套的 textBookDOS，
 * course-bag-activities 用 extractCourseOptions 转选项），所以保持原始形状。
 */
export const useCourseBagDictionary = createDictionaryStore<ApiEntity>({
  label: '课程包列表',
  fetcher: async () => {
    const items = await listCourseBags();
    return Array.isArray(items) ? items : [];
  },
});

/** 角色字典：`role/list`，返回 `{ id, name }` 形状 */
export const useRoleDictionary = createDictionaryStore<DictionaryOption>({
  label: '角色列表',
  fetcher: async () => {
    const items = await listRoles();
    return Array.isArray(items) ? (items as DictionaryOption[]) : [];
  },
});

/* ── selectors：只订阅 items，避免 loading/error 变化引发无关重渲染 ── */

export const selectDictionaryItems = <TItem>(state: { items: TItem[] }): TItem[] => state.items;

export const selectDictionaryEnsure = <TItem>(
  state: { ensure: (options?: { force?: boolean }) => Promise<TItem[]> },
) => state.ensure;
