export function flattenRoleMenuIds(tree, acc = []) {
  tree.forEach((item) => {
    acc.push(item.id);
    if (item.children?.length) {
      flattenRoleMenuIds(item.children, acc);
    }
  });
  return acc;
}

export function transformRoleTreeData(tree = []) {
  return tree.map((item) => ({
    key: item.id,
    title: item.name,
    children: transformRoleTreeData(item.children || []),
  }));
}
