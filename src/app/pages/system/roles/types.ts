import type { Key } from 'react';

export type RoleRecord = {
  id: number | string;
  name?: string;
  children?: RoleRecord[];
} & Record<string, unknown>;

export type RoleSearchValues = {
  keyword?: string;
};

export type RoleCreateValues = {
  name?: string;
};

export type CurrentRole = {
  id: number | string | '';
  name: string;
};

export type RoleCheckedKey = Key;
