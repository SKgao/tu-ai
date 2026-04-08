import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { App, Button, Card, Image, Table, Typography } from 'antd';
import { listInviteRecords } from '@/app/services/invite-count';

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

export function InviteCountPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const [inviteList, setInviteList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInviteList() {
      setLoading(true);
      try {
        const data = await listInviteRecords(Number(userId));
        setInviteList(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        message.error(error?.message || '邀请明细加载失败');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadInviteList();
      return;
    }

    setInviteList([]);
    setLoading(false);
    message.error('缺少图图号，无法加载邀请明细');
  }, [userId]);

  const columns = useMemo(
    () => [
      { title: '图图号', dataIndex: 'tutuNumber', render: (value) => value ?? '-' },
      { title: '用户昵称', dataIndex: 'realName', render: (value) => value || '无' },
      {
        title: '用户头像',
        dataIndex: 'icon',
        render: (value, record) =>
          value ? (
            <Image
              width={52}
              height={52}
              style={{ borderRadius: 16, objectFit: 'cover' }}
              src={value}
              alt={record.realName || 'invite'}
            />
          ) : (
            <Typography.Text type="secondary">无</Typography.Text>
          ),
      },
      { title: '手机号', dataIndex: 'mobile', render: (value) => value || '无' },
      { title: '邀请时间', dataIndex: 'inviteTime', render: (value) => value || '-' },
    ],
    [],
  );

  return (
    <div className="page-stack">
      <Card>
        <Typography.Text type="secondary">Legacy Rewrite</Typography.Text>
        <Typography.Title level={2} style={{ margin: '8px 0 0' }}>
          邀请明细
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          这一页对应旧版 `inviteCount` 模块，展示当前用户的邀请用户列表。
        </Typography.Paragraph>
      </Card>

      <Card>
        <div className="toolbar-grid toolbar-grid--compact">
          <Typography.Text type="secondary">当前图图号: {userId || '-'}</Typography.Text>
          <Button onClick={() => navigate(-1)}>返回上一层</Button>
        </div>
      </Card>

      <Card title="邀请用户列表" extra={<Typography.Text type="secondary">共 {inviteList.length} 条记录</Typography.Text>}>
        <Table
          rowKey={(row, index) => `${row.tutuNumber || 'invite'}-${index}`}
          columns={columns}
          dataSource={inviteList}
          loading={loading}
          scroll={{ x: 820 }}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
}
