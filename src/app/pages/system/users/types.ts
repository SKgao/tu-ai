import type { Dayjs } from 'dayjs';

export type UserRecord = {
  id: number | string;
  account?: string;
  phone?: string;
  email?: string;
  name?: string;
  sex?: number | string;
  roleid?: number | string;
  roleId?: number | string;
  roleName?: string;
  status?: number | string;
  avatar?: string;
  createtime?: string;
} & Record<string, unknown>;

export type RoleOption = {
  id: number | string;
  name?: string;
} & Record<string, unknown>;

export type UserQuery = {
  pageNum: number;
  pageSize: number;
  account: string;
  startTime: string;
  endTime: string;
};

export type UserListResult = {
  data?: UserRecord[];
  totalCount?: number;
} & Record<string, unknown>;

export type UserSearchValues = {
  account?: string;
  startTime?: Dayjs;
  endTime?: Dayjs;
};

export type UserFormValues = {
  id?: number | string;
  account?: string;
  password?: string;
  confirmPassword?: string;
  email?: string;
  phone?: string;
  name?: string;
  sex?: number | string;
  roleid?: number | string;
  status?: number | string;
  avatar?: string;
};

export type PasswordFormValues = {
  id?: number | string;
  password?: string;
  confirmPassword?: string;
};

export type UserStatusMeta = {
  text: string;
  color: string;
};
