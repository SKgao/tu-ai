export type MenuTreeNode = {
  id: number;
  parentId: number;
  name: string;
  menuName: string;
  path: string;
  icon: string;
  menuScope: number;
  url: string;
  status: number;
  sortValue: number;
  createdAt: string;
  updatedAt: string;
  children: MenuTreeNode[];
};

export function buildMenuTree<T extends { id: number; parentId: number | null; sortValue: number }>(
  items: T[],
  mapper: (item: T) => Omit<MenuTreeNode, 'children'>,
) {
  const nodes = new Map<number, MenuTreeNode>();
  const roots: MenuTreeNode[] = [];

  [...items]
    .sort((a, b) => a.sortValue - b.sortValue || a.id - b.id)
    .forEach((item) => {
      nodes.set(item.id, {
        ...mapper(item),
        children: [],
      });
    });

  nodes.forEach((node) => {
    const parent = nodes.get(node.parentId);
    if (parent) {
      parent.children.push(node);
      return;
    }
    roots.push(node);
  });

  return roots;
}

export function normalizePrimitivePayload<T>(payload: unknown, fallbackKey: string): Partial<T> {
  if (typeof payload === 'string') {
    return { [fallbackKey]: payload } as Partial<T>;
  }

  if (typeof payload === 'number') {
    return { [fallbackKey]: payload } as Partial<T>;
  }

  return (payload as Partial<T>) || {};
}
