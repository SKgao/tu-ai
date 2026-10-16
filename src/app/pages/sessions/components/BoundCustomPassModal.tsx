import { Modal, Table, Typography } from 'antd';
import { createBoundCustomPassColumns } from '../configs/tableColumns';
import type { BoundCustomPassRecord, SelectedSession } from '../types';

type BoundCustomPassModalProps = {
  open: boolean;
  selectedSession: SelectedSession;
  boundCustomPasses: BoundCustomPassRecord[];
  actionSubmitting: boolean;
  onCancel: () => void;
  onSortChange: (
    item: BoundCustomPassRecord,
    value: string | number | null | undefined,
  ) => void | Promise<void>;
  onUnbind: (item: BoundCustomPassRecord) => void | Promise<void>;
};

export function BoundCustomPassModal({
  open,
  selectedSession,
  boundCustomPasses,
  actionSubmitting,
  onCancel,
  onSortChange,
  onUnbind,
}: BoundCustomPassModalProps) {
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
      <Table<BoundCustomPassRecord>
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
