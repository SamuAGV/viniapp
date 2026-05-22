import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerTitle: 'Iniciar Sesión' }} />
      <Stack.Screen name="register" options={{ headerTitle: 'Registrarse' }} />
    </Stack>
  );
}