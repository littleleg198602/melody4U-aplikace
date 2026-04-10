import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#11041f' },
        headerTintColor: '#f5efff',
        contentStyle: { backgroundColor: '#11041f' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Melody4U' }} />
      <Stack.Screen name="create" options={{ title: 'Create Greeting' }} />
      <Stack.Screen name="pricing" options={{ title: 'Pricing' }} />
      <Stack.Screen name="share/[id]" options={{ title: 'Greeting Playback' }} />
    </Stack>
  );
}
