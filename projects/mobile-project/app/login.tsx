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

type LoginFormState = {
  identifier: string;
  password: string;
};

const LoginScreen = () => {
  const { status, login, error } = useAuth();
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

  const registerHref = useMemo<Href>(
    () =>
      ({
        pathname: '/register',
        params: { redirect: safeRedirect },
      }) as unknown as Href,
    [safeRedirect],
  );

  const [form, setForm] = useState<LoginFormState>({
    identifier: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const combinedError = formError ?? error;

  const handleChange = (key: keyof LoginFormState) => (value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    if (formError) {
      setFormError(null);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const identifier = form.identifier.trim();
    if (!identifier) {
      setFormError('请输入用户名或邮箱');
      return;
    }

    if (!form.password) {
      setFormError('请输入密码');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
  await login({ identifier, password: form.password });
  router.replace(safeRedirectHref);
    } catch (err) {
      const fallback = '登录失败，请稍后再试';
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
            <Text style={styles.title}>账户登录</Text>
            <Text style={styles.subtitle}>
              欢迎回来，请输入您的账户凭证继续操作。
            </Text>

            {combinedError ? (
              <Text style={styles.errorText}>{combinedError}</Text>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>用户名或邮箱</Text>
              <TextInput
                style={styles.input}
                value={form.identifier}
                onChangeText={handleChange('identifier')}
                placeholder="请输入用户名或邮箱"
                placeholderTextColor={palette.textMuted}
                autoCapitalize="none"
                autoComplete="username"
                keyboardType="email-address"
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
              <Text style={styles.buttonLabel}>登录</Text>
            </Button>

            <View style={styles.footer}>
              <Text style={styles.footerText}>还没有账号？</Text>
              <Link href={registerHref} replace asChild>
                <Text style={styles.footerLink}>立即注册</Text>
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

export default LoginScreen;
