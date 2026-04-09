import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Button, Card, Table, Typography } from 'antd';
import type { TablePaginationConfig } from 'antd';
import { PageHeaderCard } from '@/app/components/page/PageHeaderCard';
import { PageToolbarCard } from '@/app/components/page/PageToolbarCard';
import { listInviteRecords } from '@/app/services/invite-count';
import { createInviteColumns } from './configs/tableColumns';
import type { InviteRecord } from './types';

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function InviteCountPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const [inviteList, setInviteList] = useState<InviteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const columns = useMemo(() => createInviteColumns(), []);

  useEffect(() => {
    async function loadInviteList() {
      setLoading(true);
      try {
        const data = await listInviteRecords(Number(userId));
        setInviteList(Array.isArray(data?.data?.data) ? (data.data.data as InviteRecord[]) : []);
      } catch (loadError) {
        message.error(getErrorMessage(loadError, '邀请明细加载失败'));
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      void loadInviteList();
      return;
    }

    setInviteList([]);
    setLoading(false);
    message.error('缺少图图号，无法加载邀请明细');
  }, [message, userId]);

  const pagination: TablePaginationConfig = {
    showSizeChanger: true,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    showTotal: (total) => `共 ${total} 条记录`,
  };

  return (
    <div className="page-stack">
      <PageHeaderCard
        title="邀请明细"
        description="这一页对应旧版 `inviteCount` 模块，展示当前用户的邀请用户列表。"
      />

      <PageToolbarCard>
        <div className="toolbar-grid toolbar-grid--compact">
          <Typography.Text type="secondary">当前图图号: {userId || '-'}</Typography.Text>
          <Button onClick={() => navigate(-1)}>返回上一层</Button>
        </div>
      </PageToolbarCard>

      <Card title="邀请用户列表" extra={<Typography.Text type="secondary">共 {inviteList.length} 条记录</Typography.Text>}>
        <Table<InviteRecord>
          rowKey={(row, index) => `${row.tutuNumber || 'invite'}-${index}`}
          columns={columns}
          dataSource={inviteList}
          loading={loading}
          scroll={{ x: 820 }}
          pagination={pagination}
        />
      </Card>
    </div>
  );
}
