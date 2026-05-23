import { Stack } from 'expo-router';
import { ActivityIndicator, View, useWindowDimensions } from 'react-native';
import { AccessibilityProvider, useAccessibility } from '../src/context/AccessibilityContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { talkBackEnabled } = useAccessibility();
  const { width, height } = useWindowDimensions();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View 
      style={{ flex: 1 }}
      accessible={true}
      accessibilityLabel={`Pantalla principal. Ancho: ${Math.round(width)}, Alto: ${Math.round(height)}. TalkBack ${talkBackEnabled ? 'activado' : 'desactivado'}.`}
    >
      <Stack>
        {!user ? (
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        )}
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <RootLayoutNav />
      </AccessibilityProvider>
    </AuthProvider>
  );
}