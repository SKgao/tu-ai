import type { ReactNode } from 'react';
import { Card, Space, Typography } from 'antd';

type PageToolbarCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function PageToolbarCard({
  title,
  description,
  actions,
  children,
}: PageToolbarCardProps) {
  const hasHeader = title || description || actions;

  return (
    <Card>
      {hasHeader ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: children ? 16 : 0,
          }}
        >
          {title || description ? (
            <Space orientation="vertical" size={4}>
              {title ? (
                <Typography.Title level={4} style={{ marginBottom: 0 }}>
                  {title}
                </Typography.Title>
              ) : null}
              {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
            </Space>
          ) : (
            <div />
          )}
          {actions ? <div>{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </Card>
  );
}
