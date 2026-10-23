import { Modal, Tree, Typography } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import type { CurrentRole, RoleCheckedKey } from '../types';

type RoleAuthorityModalProps = {
  open: boolean;
  currentRole: CurrentRole;
  treeLoading: boolean;
  treeData: TreeDataNode[];
  checkedKeys: RoleCheckedKey[];
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
  onCheck: NonNullable<TreeProps['onCheck']>;
};

export function RoleAuthorityModal({
  open,
  currentRole,
  treeLoading,
  treeData,
  checkedKeys,
  submitting,
  onCancel,
  onSubmit,
  onCheck,
}: RoleAuthorityModalProps) {
  return (
    <Modal
      title={currentRole.name ? `给 ${currentRole.name} 授权` : '角色授权'}
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText="确认授权"
      cancelText="取消"
      confirmLoading={submitting}
      width={660}
      mask={{ closable: !submitting }}
      keyboard={!submitting}
    >
      <Typography.Paragraph type="secondary">
        提交时会自动带上当前选中的菜单树节点，保持授权结构完整。
      </Typography.Paragraph>
      {treeLoading ? <Typography.Text type="secondary">权限树加载中...</Typography.Text> : null}
      {!treeLoading && !treeData.length ? <Typography.Text type="secondary">暂无可授权菜单</Typography.Text> : null}
      {!treeLoading && treeData.length ? (
        <Tree checkable defaultExpandAll checkedKeys={checkedKeys} treeData={treeData} onCheck={onCheck} />
      ) : null}
    </Modal>
  );
}
