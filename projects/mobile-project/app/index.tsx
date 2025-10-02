import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button, Card, Flex, List } from '@ant-design/react-native';
import { IconOutline } from '@ant-design/icons-react-native';
import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';

import { useAuth } from './auth-context';
import { palette } from './theme';

const loginRedirectHref = {
  pathname: '/login',
  params: { redirect: '/' },
} as unknown as Href;

const formatExpiresAt = (value: string | undefined) => {
  if (!value) {
    return '未知';
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  } catch (error) {
    console.warn('Failed to format expiresAt', error);
    return value;
  }
};

const HomeScreen = () => {
  const { status, user, session, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const sessionExpiry = useMemo(
    () => formatExpiresAt(session?.expiresAt),
    [session?.expiresAt],
  );

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  if (status === 'loading') {
    return ( 
      <SafeAreaView style={styles.loadingSafeArea}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>正在加载账户信息...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'unauthenticated') {
    return <Redirect href={loginRedirectHref} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <Card.Header
            title={`您好，${user?.username ?? '用户'}`}
            thumb={<IconOutline name="smile" size={28} style={styles.headerIcon} />}
          />
          <Card.Body>
            <View style={styles.bodyContent}>
              <Text style={styles.title}>欢迎使用 Law Manager</Text>
              <Text style={styles.subtitle}>
                您已成功登录，可继续管理您的业务信息。
              </Text>
            </View>
            <List style={styles.list}>
              <List.Item
                thumb={<IconOutline name="user" size={20} style={styles.icon} />}
              >
                <Text style={styles.listText}>用户名：{user?.username}</Text>
              </List.Item>
              <List.Item
                thumb={<IconOutline name="mail" size={20} style={styles.icon} />}
              >
                <Text style={styles.listText}>邮箱：{user?.email}</Text>
              </List.Item>
              <List.Item
                thumb={
                  <IconOutline name="clock-circle" size={20} style={styles.icon} />
                }
              >
                <Text style={styles.listText}>会话有效期：{sessionExpiry}</Text>
              </List.Item>
            </List>
            <Flex style={styles.buttonGroup} justify="center">
              <Button
                type="primary"
                loading={loggingOut}
                onPress={handleLogout}
                disabled={loggingOut}
              >
                <Text style={styles.buttonLabel}>退出登录</Text>
              </Button>
            </Flex>
          </Card.Body>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bodyContent: {
    gap: 8,
    marginBottom: 12,
  },
  buttonGroup: {
    marginTop: 16,
  },
  buttonLabel: {
    color: palette.contrastText,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  headerIcon: {
    color: palette.primary,
  },
  icon: {
    color: palette.icon,
  },
  list: {
    marginVertical: 12,
  },
  listText: {
    color: palette.text,
    fontSize: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  loadingSafeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  loadingText: {
    color: palette.textMuted,
    fontSize: 14,
  },
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 14,
  },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '600',
  },
});

export default HomeScreen;
