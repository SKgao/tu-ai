/**
 * 统一响应信封。
 *
 * 全站契约：`{ code, message, data }`，`code === 0` 表示成功。
 * 之前这个结构在 21 个 service 里被手写了 111 次、分页结构手写了 15 次，
 * 字段漏写与结构漂移都是必然（`member-records` 的邀请明细就漏了 3 个分页字段）。
 * 统一收口到这里，新增接口只需要 `ok()` / `paginate()`。
 */

export type ApiEnvelope<TData = null> = {
  code: number;
  message: string;
  data: TData;
};

/** 列表分页数据体，字段顺序与前端契约保持一致 */
export type PagedData<TItem> = {
  data: TItem[];
  totalCount: number;
  totalPages: number;
  pageNum: number;
  pageSize: number;
};

/** 成功响应（非分页） */
export function ok<TData>(data: TData, message: string): ApiEnvelope<TData> {
  return {
    code: 0,
    message,
    data,
  };
}

/** 成功响应（分页列表） */
export function paginate<TItem>(params: {
  items: TItem[];
  totalCount: number;
  pageNum: number;
  pageSize: number;
  message: string;
}): ApiEnvelope<PagedData<TItem>> {
  const { items, totalCount, pageNum, pageSize, message } = params;

  return {
    code: 0,
    message,
    data: {
      data: items,
      totalCount,
      // pageSize 在调用方已保证 >= 1，这里再兜一层避免除零
      totalPages: Math.max(1, Math.ceil(totalCount / (pageSize || 1))),
      pageNum,
      pageSize,
    },
  };
}
