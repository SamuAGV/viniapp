import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const contrast = await AsyncStorage.getItem('@high_contrast');
    const text = await AsyncStorage.getItem('@large_text');
    setHighContrast(contrast === 'true');
    setLargeText(text === 'true');
  };

  const saveSettings = async (key: string, value: boolean) => {
    await AsyncStorage.setItem(key, value.toString());
  };

  const toggleContrast = (value: boolean) => {
    setHighContrast(value);
    saveSettings('@high_contrast', value);
  };

  const toggleLargeText = (value: boolean) => {
    setLargeText(value);
    saveSettings('@large_text', value);
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const textStyle = largeText ? styles.largeText : styles.normalText;
  const containerStyle = highContrast ? styles.highContrastContainer : styles.container;

  return (
    <ScrollView style={containerStyle}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={[styles.avatarText, largeText && { fontSize: 48 }]}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, textStyle]}>{user?.name}</Text>
        <Text style={[styles.email, textStyle]}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textStyle]}>
          Configuración de Accesibilidad
        </Text>

        <View style={styles.setting}>
          <Text style={[styles.settingLabel, textStyle]}>Alto contraste</Text>
          <Switch
            value={highContrast}
            onValueChange={toggleContrast}
            accessibilityLabel="Alternar alto contraste"
          />
        </View>

        <View style={styles.setting}>
          <Text style={[styles.settingLabel, textStyle]}>Texto grande</Text>
          <Switch
            value={largeText}
            onValueChange={toggleLargeText}
            accessibilityLabel="Alternar texto grande"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textStyle]}>
          Información de la App
        </Text>
        <Text style={[styles.infoText, textStyle]}>Versión: 1.0.0</Text>
        <Text style={[styles.infoText, textStyle]}>
          Esta app cumple con principios de accesibilidad WCAG
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  highContrastContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#34495e',
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginVertical: 4,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    margin: 20,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  normalText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 22,
  },
});