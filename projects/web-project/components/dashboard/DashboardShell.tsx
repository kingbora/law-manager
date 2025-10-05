'use client';

import {
  AuditOutlined,
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  PayCircleOutlined,
  PieChartOutlined,
  RightOutlined,
  SecurityScanOutlined,
  SolutionOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Dropdown,
  Layout,
  Menu,
  Space,
  Typography,
  message,
  theme,
} from 'antd';
import type { MenuProps } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../app/auth-context';
import ProfileSettingsModal from '../profile/ProfileSettingsModal';

const { Header, Sider, Content } = Layout;

type HeaderActionContextValue = {
  setActions: (node: React.ReactNode | null) => void;
};

const DashboardHeaderActionsContext = React.createContext<HeaderActionContextValue | null>(
  null,
);

export function useDashboardHeaderActions(
  actionNode: React.ReactNode | (() => React.ReactNode) | null,
) {
  const context = useContext(DashboardHeaderActionsContext);

  useEffect(() => {
    if (!context) return;
    const resolved = typeof actionNode === 'function' ? actionNode() : actionNode;
    context.setActions(resolved ?? null);
    return () => context.setActions(null);
  }, [actionNode, context]);
}

type NavItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  {
    key: '/',
    label: '首页概览',
    icon: <HomeOutlined />,
  },
  {
    key: '/cases',
    label: '案件管理',
    icon: <BookOutlined />,
    children: [
      {
        key: '/cases/my',
        label: '我的案件',
        icon: <FolderOpenOutlined />,
      },
      {
        key: '/cases/conflict-review',
        label: '利益冲突审查',
        icon: <SecurityScanOutlined />,
      },
    ],
  },
  {
    key: '/customers',
    label: '客户管理',
    icon: <SolutionOutlined />,
  },
  {
    key: '/contracts',
    label: '合同用章管理',
    icon: <AuditOutlined />,
  },
  {
    key: '/finance',
    label: '财务管理',
    icon: <PayCircleOutlined />,
  },
  {
    key: '/reports',
    label: '数据报表',
    icon: <PieChartOutlined />,
  },
  {
    key: '/permissions',
    label: '权限管理',
    icon: <UsergroupAddOutlined />,
  },
];

type MenuItem = Required<MenuProps>['items'][number];

const labelLookup = new Map<string, string>();
const leafKeys = new Set<string>();

const buildMenuItems = (items: NavItem[]): MenuItem[] =>
  items.map((item) => {
    labelLookup.set(item.key, item.label);
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;

    if (hasChildren) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: buildMenuItems(item.children!),
      } satisfies MenuItem;
    }

    leafKeys.add(item.key);
    return {
      key: item.key,
      icon: item.icon,
      label: item.label,
    } satisfies MenuItem;
  });

const menuItems: MenuItem[] = buildMenuItems(navItems);
const leafKeyList = Array.from(leafKeys).sort((a, b) => b.length - a.length);

const roleBadgeTextMap: Record<string, string> = {
  master: 'S',
  admin: '管',
  sale: '售',
  lawyer: '律',
  laywer: '律',
  assistant: '助',
  default: '员',
};

const findNavPath = (items: NavItem[], key: string, trail: NavItem[] = []): NavItem[] => {
  for (const item of items) {
    const nextTrail = [...trail, item];
    if (item.key === key) {
      return nextTrail;
    }

    if (item.children) {
      const found = findNavPath(item.children, key, nextTrail);
      if (found.length > 0) {
        return found;
      }
    }
  }
  return [];
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = theme.useToken();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [headerActions, setHeaderActions] = useState<React.ReactNode | null>(null);

  const userAvatar = useMemo(() => {
    const withAvatar = user as typeof user & {
      avatar?: string;
      avatarUrl?: string;
      image?: string;
    };
    return withAvatar?.avatarUrl ?? withAvatar?.avatar ?? withAvatar?.image;
  }, [user]);

  const selectedKey = useMemo(() => {
    if (!pathname) {
      return ['/'];
    }

    const matchedLeaf = leafKeyList.find((key) => pathname === key || pathname.startsWith(`${key}/`));

    if (matchedLeaf) {
      return [matchedLeaf];
    }

    if (labelLookup.has(pathname)) {
      return [pathname];
    }

    return ['/'];
  }, [pathname]);

  const activeKey = selectedKey[0] ?? '';

  const breadcrumbItems = useMemo(() => {
    const textStyle: React.CSSProperties = { color: token.colorTextTertiary };
    const activeTextStyle: React.CSSProperties = { color: token.colorText };
    const homeItem = {
      title: (
        <span
          role='button'
          tabIndex={0}
          onClick={() => router.push('/')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              router.push('/');
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            cursor: 'pointer',
            color: token.colorText,
          }}
        >
          <HomeOutlined />
        </span>
      ),
    };

    if (!activeKey) {
      return [homeItem, { title: <span style={textStyle}>律所管理系统</span> }];
    }

    const path = findNavPath(navItems, activeKey);
    if (path.length === 0) {
      const fallbackLabel = labelLookup.get(activeKey) ?? '律所管理系统';
      return [homeItem, { title: <span style={textStyle}>{fallbackLabel}</span> }];
    }

    return [
      homeItem,
      ...path.map((item, index) => ({ title: <span style={index === path.length - 1 ? activeTextStyle : textStyle}>{item.label}</span> })),
    ];
  }, [activeKey, router, token.colorText]);

  const roleKey =
    typeof user?.role === 'string' && user.role.trim().length > 0
      ? user.role.trim().toLowerCase()
      : 'default';
  const roleBadgeText = roleBadgeTextMap[roleKey] ?? roleBadgeTextMap.default;
  const calendarActive = activeKey === '/calendar';

  const contextValue = useMemo<HeaderActionContextValue>(
    () => ({ setActions: setHeaderActions }),
    [],
  );

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (typeof key !== 'string') return;
    if (!leafKeys.has(key)) return;
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

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile-info',
      label: (
        <div style={{ minWidth: 160 }}>
          <Typography.Text strong>{user?.username ?? '未命名用户'}</Typography.Text>
          <Typography.Paragraph style={{ margin: 0, color: token.colorTextTertiary }}>
            {user?.role ? `角色：${user.role}` : '角色信息未知'}
          </Typography.Paragraph>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'profile-link',
      label: '个人资料',
      onClick: () => setProfileModalOpen(true),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: '退出登录',
      onClick: handleLogout,
      disabled: loggingOut,
    },
  ];

  return (
    <DashboardHeaderActionsContext.Provider value={contextValue}>
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
              background: token.colorBgLayout,
              borderBottom: `1px solid ${token.colorSplit}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
            }}
          >
            <Breadcrumb
              items={breadcrumbItems}
              separator={<RightOutlined style={{ fontSize: 12, color: token.colorTextTertiary }} />}
              style={{ margin: 0 }}
            />
            <Space align='center' size='large'>
              {headerActions}
              <Button
                type='text'
                shape='circle'
                icon={<CalendarOutlined style={{ fontSize: 18 }} />}
                style={{
                  color: calendarActive ? token.colorPrimary : token.colorTextSecondary,
                  background: calendarActive ? token.colorBgContainer : 'transparent',
                }}
                onClick={() => router.push('/calendar')}
                aria-label='日程安排'
              />
              <Badge dot>
                <Button
                  type='text'
                  shape='circle'
                  icon={<BellOutlined style={{ fontSize: 18 }} />}
                  style={{ color: token.colorTextSecondary }}
                />
              </Badge>
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement='bottomRight'>
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 999,
                    border: `1px solid ${token.colorSplit}`,
                    background: token.colorBgContainer,
                    transition: 'box-shadow 0.2s ease',
                  }}
                >
                  <Avatar size={40} src={userAvatar} icon={<UserOutlined />} />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: token.colorPrimary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: token.colorWhite,
                      border: `2px solid ${token.colorBgContainer}`,
                      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.25)',
                    }}
                  >
                    <Typography.Text
                      style={{
                        fontSize: 10,
                        lineHeight: 1,
                        fontWeight: 600,
                        color: token.colorWhite,
                      }}
                    >
                      {roleBadgeText}
                    </Typography.Text>
                  </span>
                </div>
              </Dropdown>
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
      <ProfileSettingsModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </DashboardHeaderActionsContext.Provider>
  );
}
