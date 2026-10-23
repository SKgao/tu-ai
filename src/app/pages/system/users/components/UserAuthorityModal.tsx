import { Alert, Modal, Tree, Typography } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import { MenuIcon } from '@/app/lib/menuIcons';
import type { MenuApiNode } from '@/app/services/system/menus';
import type { Key } from 'react';
import type { UserRecord } from '../types';

type UserAuthorityModalProps = {
  open: boolean;
  user: UserRecord | null;
  tree: MenuApiNode[];
  checkedKeys: Key[];
  isSuperAdmin: boolean;
  loading: boolean;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
  onCheck: (checkedKeys: Key[]) => void;
};

function toTreeData(nodes: MenuApiNode[]): TreeDataNode[] {
  return nodes.map((node) => ({
    key: node.id,
    title: (
      <span className="menu-auth-node">
        <MenuIcon name={node.icon} />
        {node.menuName}
      </span>
    ),
    children: node.children?.length ? toTreeData(node.children) : undefined,
  }));
}

export function UserAuthorityModal({
  open,
  user,
  tree,
  checkedKeys,
  isSuperAdmin,
  loading,
  submitting,
  onCancel,
  onSubmit,
  onCheck,
}: UserAuthorityModalProps) {
  const handleCheck: NonNullable<TreeProps['onCheck']> = (nextCheckedKeys) => {
    onCheck(Array.isArray(nextCheckedKeys) ? nextCheckedKeys : nextCheckedKeys.checked);
  };

  return (
    <Modal
      title={user ? `给用户 ${user.account || user.id} 授权菜单` : '用户菜单授权'}
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText="保存授权"
      cancelText="取消"
      confirmLoading={submitting}
      width={680}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        勾选的菜单会直接显示在该用户的左侧导航中；未勾选的菜单不会渲染。只勾选子菜单时会自动保留其上级目录。
      </Typography.Paragraph>
      {isSuperAdmin ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message="该用户属于超级管理员角色，始终可以看到全部菜单，此处的勾选仅作记录。"
        />
      ) : null}
      {loading ? <Typography.Text type="secondary">授权菜单加载中...</Typography.Text> : null}
      {!loading && !tree.length ? (
        <Typography.Text type="secondary">暂无可授权菜单，请先在菜单管理中维护菜单。</Typography.Text>
      ) : null}
      {!loading && tree.length ? (
        <Tree
          key={String(user?.id ?? 'user-menu')}
          checkable
          defaultExpandAll
          checkedKeys={checkedKeys}
          treeData={toTreeData(tree)}
          onCheck={handleCheck}
        />
      ) : null}
    </Modal>
  );
}
