import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@ant-design/react-native';
import { ApiError } from '@law-manager/auth-client';
import {
  Link,
  Redirect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import type { Href } from 'expo-router';

import { useAuth } from './auth-context';
import { palette } from './theme';

type RegisterFormState = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterScreen = () => {
  const { status, register, error } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string }>();
  const redirectParam = useMemo(() => {
    const value = params.redirect;
    if (typeof value !== 'string') {
      return undefined;
    }
    return value;
  }, [params.redirect]);

  const safeRedirect = useMemo(() => {
    if (!redirectParam) {
      return '/';
    }

    if (!redirectParam.startsWith('/')) {
      return '/';
    }

    if (redirectParam === '/login' || redirectParam === '/register') {
      return '/';
    }

    return redirectParam;
  }, [redirectParam]);

  const safeRedirectHref = useMemo<Href>(() => {
    if (safeRedirect === '/') {
      return '/' as const;
    }

    return { pathname: safeRedirect } as unknown as Href;
  }, [safeRedirect]);

  const loginHref = useMemo<Href>(
    () =>
      ({
        pathname: '/login',
        params: { redirect: safeRedirect },
      }) as unknown as Href,
    [safeRedirect],
  );

  const [form, setForm] = useState<RegisterFormState>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const combinedError = formError ?? error;

  const handleChange = (key: keyof RegisterFormState) => (value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    if (formError) {
      setFormError(null);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const email = form.email.trim();
    const username = form.username.trim();

    if (!email) {
      setFormError('请输入邮箱地址');
      return;
    }

    if (!emailPattern.test(email)) {
      setFormError('邮箱格式不正确');
      return;
    }

    if (!username) {
      setFormError('请输入用户名');
      return;
    }

    if (username.length < 3 || username.length > 64) {
      setFormError('用户名需在 3-64 个字符之间');
      return;
    }

    if (!form.password) {
      setFormError('请输入密码');
      return;
    }

    if (form.password.length < 8) {
      setFormError('密码至少 8 位');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFormError('两次输入的密码不一致');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await register({
        email,
        username,
        password: form.password,
      });
      router.replace(safeRedirectHref);
    } catch (err) {
      const fallback = '注册失败，请稍后再试';
      const message = err instanceof ApiError ? err.message : fallback;
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.subtitle}>正在检测您的登录状态...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'authenticated') {
    return <Redirect href={safeRedirectHref} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.formWrapper}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>创建新账户</Text>
            <Text style={styles.subtitle}>
              填写以下信息以创建账户，我们会自动为您登录。
            </Text>

            {combinedError ? (
              <Text style={styles.errorText}>{combinedError}</Text>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>邮箱</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={handleChange('email')}
                placeholder="请输入邮箱"
                placeholderTextColor={palette.textMuted}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>用户名</Text>
              <TextInput
                style={styles.input}
                value={form.username}
                onChangeText={handleChange('username')}
                placeholder="仅支持字母、数字、- 和 _"
                placeholderTextColor={palette.textMuted}
                autoCapitalize="none"
                autoComplete="username"
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>密码</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={handleChange('password')}
                placeholder="请输入密码"
                placeholderTextColor={palette.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>确认密码</Text>
              <TextInput
                style={styles.input}
                value={form.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                placeholder="请再次输入密码"
                placeholderTextColor={palette.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            <Button
              type="primary"
              style={styles.button}
              loading={submitting}
              disabled={submitting}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonLabel}>注册并登录</Text>
            </Button>

            <View style={styles.footer}>
              <Text style={styles.footerText}>已经拥有账号？</Text>
              <Link href={loginHref} replace asChild>
                <Text style={styles.footerLink}>返回登录</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 24,
  },
  buttonLabel: {
    color: palette.contrastText,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: palette.icon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: palette.danger,
    fontSize: 14,
    marginBottom: 16,
    marginTop: 12,
  },
  field: {
    gap: 8,
    marginTop: 16,
  },
  fieldLabel: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 24,
  },
  footerLink: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footerText: {
    color: palette.textMuted,
    fontSize: 14,
  },
  formWrapper: {
    flex: 1,
  },
  input: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    color: palette.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 14, android: 10 }) ?? 12,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default RegisterScreen;
