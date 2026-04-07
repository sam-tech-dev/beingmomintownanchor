import { Stack } from 'expo-router';
import { Colors } from '@/src/constants/colors';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.primary,
        headerTitleStyle: { fontWeight: '700', color: Colors.textPrimary },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="news/publish" options={{ title: 'Publish News', headerShown: true }} />
      <Stack.Screen name="town/add" options={{ title: 'Add Town', headerShown: true }} />
    </Stack>
  );
}
