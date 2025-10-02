'use client';

import { Alert, Button, Form, Input, Spin, Typography, message } from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

import { ApiError } from '@law-manager/auth-client';
import { useAuth } from '../../auth-context';

export const dynamic = 'force-dynamic';

type RegisterFormValues = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => searchParams.get('redirect') ?? '/',
    [searchParams],
  );
  const { status, register, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(redirectTo);
    }
  }, [redirectTo, router, status]);

  const handleFinish = async ({
    confirmPassword,
    ...values
  }: RegisterFormValues) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await register(values);
      message.success('注册成功，已自动为您登录');
      router.replace(redirectTo);
    } catch (err: unknown) {
      const hint =
        err instanceof ApiError ? err.message : '注册失败，请稍后重试';
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
        创建新账户
      </Typography.Title>

      {combinedError ? (
        <Alert
          type="error"
          message={combinedError}
          showIcon
          style={{ marginBottom: 24 }}
        />
      ) : null}

      <Form<RegisterFormValues>
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
        onValuesChange={() => setFormError(null)}
      >
        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: '请输入邮箱地址' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input size="large" autoComplete="email" placeholder="请输入邮箱地址" />
        </Form.Item>

        <Form.Item
          name="username"
          label="用户名"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3 },
            { max: 64 },
          ]}
        >
          <Input
            autoComplete="username"
            size="large"
            placeholder="仅支持字母、数字、- 和 _"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码至少 8 位' },
          ]}
        >
          <Input.Password
            autoComplete="new-password"
            placeholder="请输入密码"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认密码"
          dependencies={['password']}
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            autoComplete="new-password"
            placeholder="请再次输入密码"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" block loading={submitting}>
            注册并登录
          </Button>
        </Form.Item>
      </Form>

      <Typography.Paragraph style={{ textAlign: 'center', marginTop: 16 }}>
        已有账号？<Link href="/login">直接登录</Link>
      </Typography.Paragraph>
    </div>
  );
}

export default function RegisterPage() {
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
      <RegisterPageContent />
    </Suspense>
  );
}
