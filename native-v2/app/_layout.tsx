import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerLargeTitle: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#0F172A',
          },
          headerTintColor: '#F8FAFC',
          headerLargeTitleStyle: {
            color: '#F8FAFC',
          },
          headerTitleStyle: {
            color: '#F8FAFC',
          },
          contentStyle: {
            backgroundColor: '#020617',
          },
        }}
      />
    </>
  );
}
