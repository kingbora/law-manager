'use client';

import { Spin } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

import { useAuth } from '../app/auth-context';

const spinnerStyle: React.CSSProperties = {
  width: '100%',
  height: '60vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status !== 'unauthenticated') return;

    const currentQuery = searchParams.toString();
    const redirect = currentQuery ? `${pathname}?${currentQuery}` : pathname;
    const params = new URLSearchParams({ redirect });
    router.replace(`/login?${params.toString()}`);
  }, [pathname, router, searchParams, status]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div style={spinnerStyle}>
        <Spin
          size="large"
          tip={status === 'loading' ? '正在加载...' : '跳转中...'}
        />
      </div>
    );
  }

  return <>{children}</>;
}
