import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

type DateTimeValue = Dayjs | Date | string | number | null | undefined;

export function toApiDateTime(value: DateTimeValue): string {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '';
}

export function fromApiDateTime(value: string | number | null | undefined): string {
  return value ? String(value).replace(' ', 'T').slice(0, 19) : '';
}

/**
 * 展示用：把接口返回的时间统一格式化为 `YYYY-MM-DD HH:mm:ss`（本地时区）。
 *
 * 后端返回的是 ISO 字符串（如 `2026-04-08T06:49:51.619Z`），直接渲染会带出
 * `T`/`Z`/毫秒。这里用 dayjs 解析后按本地时区格式化，兼容已经是
 * `YYYY-MM-DD HH:mm:ss` 的字符串、时间戳以及 Date/Dayjs 对象。
 * 空值或无法解析时返回占位符（表格里显示为 `-`）。
 */
export function formatDateTime(value: DateTimeValue, placeholder = '-'): string {
  if (value === null || value === undefined || value === '') {
    return placeholder;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : placeholder;
}

/**
 * 展示用：只取日期部分 `YYYY-MM-DD`，用于**纯日期**语义的字段（如会员生日）。
 *
 * 这类字段后端存的是 UTC 零点（如 `2017-04-18T00:00:00.000Z`），
 * 硬套 `YYYY-MM-DD HH:mm:ss` 会因时区偏移显示成无意义的 `08:00:00`。
 */
export function formatDate(value: DateTimeValue, placeholder = '-'): string {
  if (value === null || value === undefined || value === '') {
    return placeholder;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : placeholder;
}
