import { Tabs, usePathname, useRouter } from 'expo-router';
import { Platform, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { VoiceCommands } from '../../src/components/VoiceCommands';
import { useAccessibility } from '../../src/context/AccessibilityContext';
import { useTalkBack } from '../../src/hooks/useTalkBack';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { announceAction } = useTalkBack({ enabled: true });
  const { talkBackEnabled, highContrast, largeText } = useAccessibility();

  const getCurrentScreen = () => {
    if (pathname.includes('records')) return 'records';
    if (pathname.includes('profile')) return 'profile';
    return 'home';
  };

  const handleVoiceNavigate = (screen: string) => {
    announceAction(`Navegando a ${screen}`);
    if (screen === 'home') {
      router.push('/(tabs)');
    } else if (screen === 'records') {
      router.push('/(tabs)/records');
    } else if (screen === 'profile') {
      router.push('/(tabs)/profile');
    }
  };

  const handleVoiceAction = (action: string) => {
    if (action === 'new') {
      announceAction('Abriendo nuevo registro');
    }
  };

  // Estilos dinámicos para tabs según accesibilidad
  const tabBarStyle = {
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    height: Platform.OS === 'ios' ? 85 : 65,
    backgroundColor: highContrast ? '#000000' : '#ffffff',
    borderTopColor: highContrast ? '#333333' : '#e0e0e0',
  };

  const headerStyle = {
    backgroundColor: highContrast ? '#000000' : '#2c3e50',
  };

  const headerTitleStyle = {
    color: highContrast ? '#ffffff' : '#ffffff',
    fontSize: largeText ? 20 : 18,
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#3498db',
          tabBarInactiveTintColor: highContrast ? '#888888' : '#7f8c8d',
          headerStyle: headerStyle,
          headerTintColor: '#fff',
          headerTitleStyle: headerTitleStyle,
          tabBarStyle: tabBarStyle,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="records"
          options={{
            title: 'Registros',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="list" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      
      {/* Solo mostrar el botón del micrófono si TalkBack está activado */}
      {talkBackEnabled && (
        <VoiceCommands
          onNavigate={handleVoiceNavigate}
          onAction={handleVoiceAction}
          currentScreen={getCurrentScreen()}
        />
      )}
    </View>
  );
}