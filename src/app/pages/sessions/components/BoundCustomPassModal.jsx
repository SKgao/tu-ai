import React from 'react';
import { Modal, Table, Typography } from 'antd';
import { createBoundCustomPassColumns } from '../configs/tableColumns';

export function BoundCustomPassModal({
  open,
  selectedSession,
  boundCustomPasses,
  actionSubmitting,
  onCancel,
  onSortChange,
  onUnbind,
}) {
  return (
    <Modal
      title={selectedSession.title ? `${selectedSession.title} 已绑定小关卡` : '已绑定小关卡'}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={760}
    >
      <Typography.Paragraph type="secondary">
        这里保留旧版“查看已绑定小关卡”的能力，并支持解绑与排序。
      </Typography.Paragraph>
      <Table
        rowKey="id"
        columns={createBoundCustomPassColumns({
          actionSubmitting,
          onSortChange,
          onUnbind,
        })}
        dataSource={boundCustomPasses}
        pagination={false}
        locale={{ emptyText: '暂无已绑定小关卡' }}
      />
    </Modal>
  );
}
