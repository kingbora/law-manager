import React from 'react';
import '../styles/global.css';
import AntdRegistry from './providers';

export const metadata = {
  title: '律所管理系统 - Web',
  description: 'Law firm management system web portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
