import { Stack } from 'expo-router';

export default function ChurchLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: '',
        headerBackTitleVisible: false,
        headerTintColor: '#4285F4',
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: true,
        title: 'Église',
      }}
    />
  );
}
