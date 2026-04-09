import { toApiDateTime } from '@/app/lib/dateTime';
import type {
  UserFormValues,
  UserRecord,
  UserSearchValues,
  UserStatusMeta,
} from '../types';

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const EMPTY_CREATE_FORM: UserFormValues = {
  account: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  avatar: '',
  status: '1',
  roleid: undefined,
};

export const EMPTY_EDIT_FORM: UserFormValues = {
  id: undefined,
  phone: '',
  email: '',
  name: '',
  sex: undefined,
  roleid: undefined,
  status: '1',
  avatar: '',
};

export const EMPTY_PASSWORD_FORM = {
  id: undefined,
  password: '',
  confirmPassword: '',
};

export const USER_STATUS_OPTIONS = [
  { value: '1', label: '启用' },
  { value: '2', label: '冻结' },
  { value: '3', label: '删除' },
];

export const USER_EDIT_STATUS_OPTIONS = [
  { value: '1', label: '正常' },
  { value: '2', label: '冻结' },
  { value: '3', label: '已删除' },
];

export const USER_SEX_OPTIONS = [
  { value: '1', label: '男' },
  { value: '2', label: '女' },
];

export function getStatusMeta(status: unknown): UserStatusMeta {
  const numericStatus = Number(status);

  if (numericStatus === 1) {
    return { text: '正常', color: 'success' };
  }

  if (numericStatus === 2) {
    return { text: '冻结', color: 'warning' };
  }

  if (numericStatus === 3) {
    return { text: '已删除', color: 'error' };
  }

  return { text: '未知', color: 'default' };
}

export function normalizeRoleId(user: UserRecord): string | undefined {
  const roleId = user.roleid ?? user.roleId ?? '';
  return roleId === null || roleId === undefined || roleId === '' ? undefined : String(roleId);
}

export function normalizeEditFormValues(user?: UserRecord | null): UserFormValues {
  if (!user) {
    return { ...EMPTY_EDIT_FORM };
  }

  return {
    id: Number(user.id),
    phone: String(user.phone || ''),
    email: String(user.email || ''),
    name: String(user.name || ''),
    sex: user.sex ? String(user.sex) : undefined,
    roleid: normalizeRoleId(user),
    status: user.status ? String(user.status) : '1',
    avatar: typeof user.avatar === 'string' && user.avatar !== 'string' ? user.avatar : '',
  };
}

export function buildUserSearchFilters(values: UserSearchValues = {}) {
  return {
    account: values.account?.trim() || '',
    startTime: toApiDateTime(values.startTime),
    endTime: toApiDateTime(values.endTime),
  };
}

export function isValidPhoneNumber(value: string): boolean {
  return /^1[0-9]{10}$/.test(value);
}
