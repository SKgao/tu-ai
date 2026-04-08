import React from 'react';
import { Card, Space, Typography } from 'antd';

export function PageHeaderCard({
  title,
  description,
  eyebrow = 'Legacy Rewrite',
  extra,
}) {
  return (
    <Card>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Space orientation="vertical" size={8}>
          {eyebrow ? <Typography.Text type="secondary">{eyebrow}</Typography.Text> : null}
          <Typography.Title level={2} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {description ? (
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {description}
            </Typography.Paragraph>
          ) : null}
        </Space>
        {extra ? <div>{extra}</div> : null}
      </div>
    </Card>
  );
}
