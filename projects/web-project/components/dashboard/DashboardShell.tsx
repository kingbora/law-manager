'use client';

import {
  HomeOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Layout,
  Menu,
  Space,
  Typography,
  message,
  theme,
} from 'antd';
import type { MenuProps } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { useAuth } from '../../app/auth-context';

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const menuConfig: Array<{
  key: string;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    key: '/',
    label: '首页概览',
    icon: <HomeOutlined />,
  },
  {
    key: '/clients',
    label: '客户与案件管理',
    icon: <TeamOutlined />,
  },
  {
    key: '/conflicts',
    label: '利益冲突检索',
    icon: <SearchOutlined />,
  },
  {
    key: '/permissions',
    label: '权限控制',
    icon: <SafetyCertificateOutlined />,
  },
];

const menuItems: MenuItem[] = menuConfig.map((item) => ({
  key: item.key,
  icon: item.icon,
  label: item.label,
}));

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = theme.useToken();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const selectedKey = useMemo(() => {
    if (!pathname) return ['/'];
    const match = menuConfig.find((item) => {
      if (item.key === '/') {
        return pathname === '/';
      }
      return pathname === item.key || pathname.startsWith(`${item.key}/`);
    });
    return [match?.key ?? '/'];
  }, [pathname]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (typeof key !== 'string') return;
    if (pathname === key) return;
    router.push(key);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      message.success('您已退出登录');
      router.replace('/login');
    } catch (error) {
      console.error('Failed to logout', error);
      message.error('退出失败，请稍后再试');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }} hasSider>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{
          background: token.colorBgContainer,
          boxShadow: '2px 0 12px rgba(15, 23, 42, 0.1)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 16px',
            fontWeight: 700,
            fontSize: collapsed ? 18 : 20,
            color: token.colorPrimary,
          }}
        >
          {collapsed ? 'LM' : 'Law Manager'}
        </div>
        <Menu
          mode='inline'
          selectedKeys={selectedKey}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorSplit}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            {menuConfig.find((item) => item.key === selectedKey[0])?.label ?? '律所管理系统'}
          </Typography.Title>
          <Space size='large'>
            <Space>
              <Avatar size={40} icon={<UserOutlined />} />
              <div style={{ lineHeight: 1.2 }}>
                <Typography.Text strong>{user?.username ?? '未命名用户'}</Typography.Text>
                <Typography.Paragraph style={{ margin: 0, color: token.colorTextTertiary }}>
                  {user?.role ? `角色：${user.role}` : '角色信息未知'}
                </Typography.Paragraph>
              </div>
            </Space>
            <Button type='primary' ghost onClick={handleLogout} loading={loggingOut}>
              退出登录
            </Button>
          </Space>
        </Header>
        <Content
          style={{
            padding: 24,
            background: token.colorBgLayout,
            minHeight: 0,
          }}
        >
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
