import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button, Card, Flex, List } from '@ant-design/react-native';
import { IconOutline } from '@ant-design/icons-react-native';

const palette = {
  background: '#f5f6fa',
  icon: '#1f2937',
  primary: '#1d4ed8',
  text: '#111827',
  textMuted: '#4b5563',
} as const;

const HomeScreen = () => {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <Card.Header
            title="Law Manager"
            thumb={<IconOutline name="smile" size={28} style={styles.headerIcon} />}
          />
          <Card.Body>
            <View style={styles.bodyContent}>
              <Text style={styles.title}>
                {authenticated ? '欢迎回来' : '请登录您的账号'}
              </Text>
              <Text style={styles.subtitle}>
                使用 Ant Design React Native 组件构建的示例界面
              </Text>
            </View>
            <List style={styles.list}>
              <List.Item
                thumb={<IconOutline name="user" size={20} style={styles.icon} />}
              >
                <Text style={styles.listText}>
                  当前状态：{authenticated ? '已登录' : '未登录'}
                </Text>
              </List.Item>
              <List.Item
                thumb={<IconOutline name="lock" size={20} style={styles.icon} />}
              >
                <Text style={styles.listText}>
                  安全提示：请妥善保管您的登录凭证
                </Text>
              </List.Item>
            </List>
            <Flex style={styles.buttonGroup} justify="center">
              <Button
                type="primary"
                onPress={() => setAuthenticated((current: boolean) => !current)}
              >
                {authenticated ? '退出登录' : '立即登录'}
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
