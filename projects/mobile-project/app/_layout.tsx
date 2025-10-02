import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { Provider } from '@ant-design/react-native';
import { useFonts } from 'expo-font';

import { AuthProvider } from './auth-context';

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <Provider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" />
        </View>
      </Provider>
    );
  }

  return (
    <Provider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerTitleAlign: 'center',
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: '账户登录' }} />
          <Stack.Screen name="register" options={{ title: '创建账户' }} />
        </Stack>
      </AuthProvider>
    </Provider>
  );
};

export default RootLayout;
