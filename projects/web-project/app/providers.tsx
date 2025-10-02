'use client';
import { App as AntApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';

import { AuthProvider } from './auth-context';

export default function AntdRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{ token: { colorPrimary: '#1677ff' } }}
    >
      <AntApp>
        <AuthProvider>{children}</AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}
