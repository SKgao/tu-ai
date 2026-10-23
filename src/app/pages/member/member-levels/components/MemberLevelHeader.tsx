import { Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

type MemberLevelHeaderProps = {
  count: number;
  loading: boolean;
  onCreate: () => void;
  onRefresh: () => void | Promise<void>;
};

export function MemberLevelHeader({
  count,
  loading,
  onCreate,
  onRefresh,
}: MemberLevelHeaderProps) {
  return (
    <Space wrap>
      <Typography.Text type="secondary">共 {count} 个会员等级</Typography.Text>
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
        添加会员等级
      </Button>
      <Button onClick={() => void onRefresh()} loading={loading}>
        刷新
      </Button>
    </Space>
  );
}
