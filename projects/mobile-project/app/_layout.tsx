import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { Provider } from '@ant-design/react-native';
import { useFonts } from 'expo-font';

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
      <Stack screenOptions={{ headerShown: false }} />
    </Provider>
  );
};

export default RootLayout;
