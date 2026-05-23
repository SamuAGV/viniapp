import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAccessibility } from '../../src/context/AccessibilityContext';
import { useAuth } from '../../src/context/AuthContext';
import { useTalkBack } from '../../src/hooks/useTalkBack';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { 
    highContrast, 
    largeText, 
    talkBackEnabled,
    toggleHighContrast, 
    toggleLargeText,
    toggleTalkBack
  } = useAccessibility();
  
  const { announceScreen, announceAction, announceSuccess, announceError } = useTalkBack({ enabled: talkBackEnabled });

  useEffect(() => {
    announceScreen('Perfil de usuario. Aquí puedes ver tu información y configurar la accesibilidad.');
  }, []);

  const handleLogout = () => {
    announceAction('¿Estás seguro de que quieres cerrar sesión?');
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres salir?', [
      { 
        text: 'Cancelar', 
        style: 'cancel',
        onPress: () => announceAction('Cierre de sesión cancelado')
      },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            announceSuccess('Has cerrado sesión correctamente');
            router.replace('/(auth)/login');
          } catch (error) {
            announceError('Error al cerrar sesión');
            console.error(error);
          }
        },
      },
    ]);
  };

  const textStyle = largeText ? styles.largeText : styles.normalText;
  const containerStyle = highContrast ? styles.highContrastContainer : styles.container;

  return (
    <ScrollView 
      style={containerStyle}
      accessible={true}
      accessibilityLabel="Pantalla de perfil de usuario"
      accessibilityRole="none"
    >
      <View style={[styles.header, highContrast && styles.highContrastHeader]}>
        <View 
          style={[styles.avatar, highContrast && styles.highContrastAvatar]}
          accessible={true}
          accessibilityLabel={`Avatar de ${user?.name}`}
          accessibilityRole="image"
        >
          <Text style={[styles.avatarText, largeText && { fontSize: 48 }]}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text 
          style={[styles.name, textStyle, highContrast && styles.highContrastText]}
          accessible={true}
          accessibilityLabel={`Nombre: ${user?.name}`}
          accessibilityRole="text"
        >
          {user?.name}
        </Text>
        <Text 
          style={[styles.email, textStyle, highContrast && styles.highContrastText]}
          accessible={true}
          accessibilityLabel={`Correo electrónico: ${user?.email}`}
          accessibilityRole="text"
        >
          {user?.email}
        </Text>
      </View>

      <View style={[styles.section, highContrast && styles.highContrastSection]}>
        <Text 
          style={[styles.sectionTitle, textStyle, highContrast && styles.highContrastText]}
          accessible={true}
          accessibilityLabel="Configuración de accesibilidad"
          accessibilityRole="header"
        >
          Configuración de Accesibilidad
        </Text>

        <View style={styles.setting}>
          <Text 
            style={[styles.settingLabel, textStyle, highContrast && styles.highContrastText]}
            accessible={true}
            accessibilityLabel="Alto contraste. Cambia los colores de la aplicación para mejor visibilidad."
            accessibilityRole="text"
          >
            Alto contraste
          </Text>
          <Switch
            value={highContrast}
            onValueChange={toggleHighContrast}
            accessibilityLabel="Alternar alto contraste"
            accessibilityHint="Activa o desactiva el modo de alto contraste para mejorar la visibilidad"
            accessibilityRole="none"
          />
        </View>

        <View style={styles.setting}>
          <Text 
            style={[styles.settingLabel, textStyle, highContrast && styles.highContrastText]}
            accessible={true}
            accessibilityLabel="Texto grande. Aumenta el tamaño de todas las letras en la aplicación."
            accessibilityRole="text"
          >
            Texto grande
          </Text>
          <Switch
            value={largeText}
            onValueChange={toggleLargeText}
            accessibilityLabel="Alternar texto grande"
            accessibilityHint="Activa o desactiva el modo de texto grande para facilitar la lectura"
            accessibilityRole="none"
          />
        </View>

        <View style={styles.setting}>
          <Text 
            style={[styles.settingLabel, textStyle, highContrast && styles.highContrastText]}
            accessible={true}
            accessibilityLabel={`TalkBack o VoiceOver. Asistente de voz ${talkBackEnabled ? 'activado' : 'desactivado'}. Traza una L en cualquier pantalla para alternar.`}
            accessibilityRole="text"
          >
            Asistente de voz (TalkBack)
          </Text>
          <Switch
            value={talkBackEnabled}
            onValueChange={toggleTalkBack}
            accessibilityLabel="Alternar TalkBack"
            accessibilityHint={`${talkBackEnabled ? 'Desactiva' : 'Activa'} el asistente de voz. También puedes trazar una L en la pantalla.`}
            accessibilityRole="none"
          />
        </View>
        
        <View style={styles.infoBox}>
          <Text style={[styles.infoBoxText, textStyle, highContrast && styles.highContrastText]}>
            Tip: Puedes activar/desactivar TalkBack trazando una "L" en cualquier parte de la pantalla con tu dedo.
          </Text>
        </View>
      </View>

      <View style={[styles.section, highContrast && styles.highContrastSection]}>
        <Text 
          style={[styles.sectionTitle, textStyle, highContrast && styles.highContrastText]}
          accessible={true}
          accessibilityLabel="Información de la aplicación"
          accessibilityRole="header"
        >
          Información de la App
        </Text>
        
        <View 
          style={styles.infoItem}
          accessible={true}
          accessibilityLabel="Versión de la aplicación: 1 punto 0 punto 0"
          accessibilityRole="text"
        >
          <Text style={[styles.infoLabel, textStyle, highContrast && styles.highContrastText]}>
            Versión:
          </Text>
          <Text style={[styles.infoValue, textStyle, highContrast && styles.highContrastText]}>
            1.0.0
          </Text>
        </View>
        
        <View 
          style={styles.infoItem}
          accessible={true}
          accessibilityLabel="Compatible con TalkBack y VoiceOver"
          accessibilityRole="text"
        >
          <Text style={[styles.infoLabel, textStyle, highContrast && styles.highContrastText]}>
            Accesibilidad:
          </Text>
          <Text style={[styles.infoValue, textStyle, highContrast && styles.highContrastText]}>
            TalkBack / VoiceOver
          </Text>
        </View>
        
        <View 
          style={styles.infoItem}
          accessible={true}
          accessibilityLabel="Comandos de voz disponibles. Traza una L para activar."
          accessibilityRole="text"
        >
          <Text style={[styles.infoLabel, textStyle, highContrast && styles.highContrastText]}>
            Comandos de voz:
          </Text>
          <Text style={[styles.infoValue, textStyle, highContrast && styles.highContrastText]}>
            Gesto "L"
          </Text>
        </View>
        
        {/*<Text 
          style={[styles.infoText, textStyle, highContrast && styles.highContrastText]}
          accessible={true}
          accessibilityLabel="Esta aplicación cumple con los principios de accesibilidad WCAG para garantizar una experiencia inclusiva."
          accessibilityRole="text"
        >
          Esta app cumple con principios de accesibilidad WCAG
          para garantizar una experiencia inclusiva para todos los usuarios.
        </Text>*/}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityLabel="Cerrar sesión"
        accessibilityRole="button"
        accessibilityHint="Cierra tu sesión actual y vuelve a la pantalla de inicio de sesión"
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text 
          style={[styles.footerText, textStyle, highContrast && styles.highContrastText]}
          accessible={true}
          accessibilityLabel="App Accesible - Versión inclusiva para todos"
          accessibilityRole="text"
        >

        </Text>
      </View>
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
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  highContrastHeader: {
    backgroundColor: '#111111',
    borderBottomColor: '#333333',
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
  highContrastAvatar: {
    backgroundColor: '#007acc',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarText: {
    color: '#ffffff',
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
  highContrastText: {
    color: '#ffffff',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    padding: 16,
  },
  highContrastSection: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
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
  infoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  infoValue: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    margin: 20,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
  },
  normalText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 22,
  },
});