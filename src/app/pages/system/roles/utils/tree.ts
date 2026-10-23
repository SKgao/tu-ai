import type { TreeDataNode } from 'antd';
import type { RoleCheckedKey, RoleRecord } from '../types';

export function flattenRoleMenuIds(tree: RoleRecord[], acc: RoleCheckedKey[] = []): RoleCheckedKey[] {
  tree.forEach((item) => {
    acc.push(item.id);
    if (item.children?.length) {
      flattenRoleMenuIds(item.children, acc);
    }
  });
  return acc;
}

export function transformRoleTreeData(tree: RoleRecord[] = []): TreeDataNode[] {
  return tree.map((item) => ({
    key: item.id,
    title: item.name,
    children: transformRoleTreeData(item.children || []),
  }));
}
