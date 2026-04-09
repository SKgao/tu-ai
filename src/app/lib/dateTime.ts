import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

type DateTimeValue = Dayjs | Date | string | number | null | undefined;

export function toApiDateTime(value: DateTimeValue): string {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '';
}

export function fromApiDateTime(value: string | number | null | undefined): string {
  return value ? String(value).replace(' ', 'T').slice(0, 19) : '';
}
