import dayjs from 'dayjs';

export function toApiDateTime(value) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '';
}

export function fromApiDateTime(value) {
  return value ? String(value).replace(' ', 'T').slice(0, 19) : '';
}
