'use client';

import { Alert, Button, Form, Input, Spin, Typography, message } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

import { ApiError } from '@law-manager/auth-client';
import { useAuth } from '../../auth-context';

export const dynamic = 'force-dynamic';

type LoginFormValues = {
  identifier: string;
  password: string;
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => searchParams.get('redirect') ?? '/',
    [searchParams],
  );
  const { status, login, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(redirectTo);
    }
  }, [redirectTo, router, status]);

  const handleFinish = async (values: LoginFormValues) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await login(values);
      message.success('登录成功');
      router.replace(redirectTo);
    } catch (err: unknown) {
      const hint =
        err instanceof ApiError ? err.message : '登录失败，请稍后重试';
      setFormError(hint);
    } finally {
      setSubmitting(false);
    }
  };

  const combinedError = formError ?? error;

  return (
    <div>
      <Typography.Title
        level={3}
        style={{ marginBottom: 24, textAlign: 'center' }}
      >
        账户登录
      </Typography.Title>

      {combinedError ? (
        <Alert
          type="error"
          message={combinedError}
          showIcon
          style={{ marginBottom: 24 }}
        />
      ) : null}

      <Form<LoginFormValues>
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
        onValuesChange={() => setFormError(null)}
      >
        <Form.Item
          name="identifier"
          label="用户名或邮箱"
          rules={[{ required: true, message: '请输入用户名或邮箱' }]}
        >
          <Input
            autoComplete="username"
            size="large"
            placeholder="请输入用户名或邮箱"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            autoComplete="current-password"
            placeholder="请输入密码"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block loading={submitting}>
            登录
          </Button>
        </Form.Item>
      </Form>

      <Typography.Paragraph style={{ textAlign: 'center', marginTop: 16 }}>
        还没有账号？<Link href="/register">立即注册</Link>
      </Typography.Paragraph>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '32px 0',
          }}
        >
          <Spin tip="正在加载..." />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
