'use client';

import { Card, Space, Typography } from 'antd';

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Title level={2}>律所管理系统 (Web)</Typography.Title>
        <Card title="快速入口">
          <Typography.Paragraph>
            欢迎使用律所管理系统。请从左侧导航或顶部菜单进入功能模块。
          </Typography.Paragraph>
        </Card>
      </Space>
    </main>
  );
}
