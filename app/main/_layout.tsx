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
      <Stack.Screen name="people/index" options={{ title: 'People', headerShown: true }} />
      <Stack.Screen name="people/add" options={{ title: 'Add Person', headerShown: true }} />
      <Stack.Screen name="people/[id]/index" options={{ title: 'Edit Person', headerShown: true }} />
      <Stack.Screen name="anchors/index" options={{ title: 'Town Anchors', headerShown: true }} />
      <Stack.Screen name="profile" options={{ title: 'Edit Profile', headerShown: true }} />
    </Stack>
  );
}
