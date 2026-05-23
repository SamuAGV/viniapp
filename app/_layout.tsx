import { Stack } from 'expo-router';
import { ActivityIndicator, View, useWindowDimensions } from 'react-native';
import { AccessibilityProvider, useAccessibility } from '../src/context/AccessibilityContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useTalkBack } from '../src/hooks/useTalkBack';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { talkBackEnabled, toggleTalkBack } = useAccessibility();
  const { panResponder } = useTalkBack({ 
    enabled: talkBackEnabled, 
    onToggle: toggleTalkBack 
  });
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
      {...panResponder.panHandlers} 
      style={{ flex: 1 }}
      accessible={true}
      accessibilityLabel={`Pantalla principal. Ancho: ${Math.round(width)}, Alto: ${Math.round(height)}. TalkBack ${talkBackEnabled ? 'activado' : 'desactivado'}. Traza una L en la pantalla para ${talkBackEnabled ? 'desactivar' : 'activar'} TalkBack.`}
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