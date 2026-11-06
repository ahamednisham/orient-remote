import {
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  useFonts,
} from '@expo-google-fonts/barlow';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useTheme } from '@/constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const theme = useTheme();
  const [loaded, fontError] = useFonts({ Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold });
  const ready = loaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      />
    </>
  );
}
