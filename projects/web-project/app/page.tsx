'use client';

import {
  Button,
  Card,
  Descriptions,
  Space,
  Spin,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

import RequireAuth from '../components/RequireAuth';
import { useAuth } from './auth-context';

export const dynamic = 'force-dynamic';

function HomePageContent() {
  const { user, session, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      message.success('您已退出登录');
      router.replace('/login');
    } catch (error) {
      console.error('Failed to logout', error);
      message.error('退出失败，请稍后再试');
    } finally {
      setIsLoggingOut(false);
    }
  };
  return (
    <RequireAuth>
      <main style={{ padding: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Typography.Title level={2}>律所管理系统 (Web)</Typography.Title>
          <Card
            title="账户信息"
            extra={
              <Button type="link" onClick={handleLogout} loading={isLoggingOut}>
                退出登录
              </Button>
            }
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="用户名">
                {user?.username}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
              <Descriptions.Item label="账户创建时间">
                {user?.createdAt
                  ? dayjs(user.createdAt).format('YYYY-MM-DD HH:mm')
                  : '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="最近更新时间">
                {user?.updatedAt
                  ? dayjs(user.updatedAt).format('YYYY-MM-DD HH:mm')
                  : '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="当前会话过期时间">
                {session?.expiresAt
                  ? dayjs(session.expiresAt).format('YYYY-MM-DD HH:mm')
                  : '未知'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="快速入口">
            <Typography.Paragraph>
              欢迎使用律所管理系统。请通过上方导航或功能模块开始您的工作。
            </Typography.Paragraph>
          </Card>
        </Space>
      </main>
    </RequireAuth>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '48px 0',
          }}
        >
          <Spin tip="正在加载用户信息..." />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
