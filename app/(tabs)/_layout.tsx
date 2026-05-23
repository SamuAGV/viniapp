import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAccessibility } from '../../src/context/AccessibilityContext';
import { useAuth } from '../../src/context/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();
  const { highContrast, largeText } = useAccessibility();
  
  // Verificación de administrador
  const isAdmin = user?.role === 'admin';

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

  // Definir las tabs base (siempre presentes)
  const baseScreens = [
    {
      name: "index",
      title: "Inicio",
      icon: "home"
    },
    {
      name: "records",
      title: "Registros",
      icon: "list"
    },
    {
      name: "profile",
      title: "Perfil",
      icon: "person"
    }
  ];

  // Agregar Admin solo si es necesario
  const allScreens = isAdmin 
    ? [
        ...baseScreens,
        {
          name: "admin",
          title: "Admin",
          icon: "admin-panel-settings"
        }
      ]
    : baseScreens;

  return (
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
      {allScreens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={screen.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}