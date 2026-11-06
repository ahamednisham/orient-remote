import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Palette } from '@/constants/palette';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Palette.bg },
        }}
      />
    </>
  );
}
