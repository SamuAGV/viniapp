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

  const isAdmin = user?.role === 'admin';
  const textStyle = largeText ? styles.largeText : styles.normalText;
  const containerStyle = highContrast ? styles.highContrastContainer : styles.container;
  const cardStyle = highContrast ? styles.highContrastCard : styles.card;
  const textColorStyle = highContrast ? styles.highContrastText : styles.normalText;

  return (
    <ScrollView style={containerStyle}>
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
          style={[styles.name, textStyle, textColorStyle]}
          accessible={true}
          accessibilityLabel={`Nombre: ${user?.name}`}
          accessibilityRole="text"
        >
          {user?.name}
        </Text>
        <Text 
          style={[styles.email, textStyle, textColorStyle]}
          accessible={true}
          accessibilityLabel={`Correo electrónico: ${user?.email}`}
          accessibilityRole="text"
        >
          {user?.email}
        </Text>
        {isAdmin && (
          <View style={styles.adminBadge}>
            <Text style={[styles.adminBadgeText, textStyle]}>Administrador</Text>
          </View>
        )}
      </View>

      <View style={[styles.section, cardStyle]}>
        <Text style={[styles.sectionTitle, textStyle, textColorStyle]}>
          Configuración de Accesibilidad
        </Text>

        <View style={styles.setting}>
          <Text style={[styles.settingLabel, textStyle, textColorStyle]}>
            Alto contraste
          </Text>
          <Switch
            value={highContrast}
            onValueChange={toggleHighContrast}
            accessibilityLabel="Alternar alto contraste"
            accessibilityHint="Activa o desactiva el modo de alto contraste"
          />
        </View>

        <View style={styles.setting}>
          <Text style={[styles.settingLabel, textStyle, textColorStyle]}>
            Texto grande
          </Text>
          <Switch
            value={largeText}
            onValueChange={toggleLargeText}
            accessibilityLabel="Alternar texto grande"
            accessibilityHint="Activa o desactiva el texto grande"
          />
        </View>

        <View style={styles.setting}>
          <Text style={[styles.settingLabel, textStyle, textColorStyle]}>
            Asistente de voz (TalkBack)
          </Text>
          <Switch
            value={talkBackEnabled}
            onValueChange={toggleTalkBack}
            accessibilityLabel="Alternar TalkBack"
            accessibilityHint={`${talkBackEnabled ? 'Desactiva' : 'Activa'} el asistente de voz`}
          />
        </View>
        
        <View style={styles.infoBox}>
          <Text style={[styles.infoBoxText, textStyle, textColorStyle]}>
            Las configuraciones de accesibilidad se guardan automáticamente
          </Text>
        </View>
      </View>

      <View style={[styles.section, cardStyle]}>
        <Text style={[styles.sectionTitle, textStyle, textColorStyle]}>
          Información de la App
        </Text>
        
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, textStyle, textColorStyle]}>
            Versión:
          </Text>
          <Text style={[styles.infoValue, textStyle, textColorStyle]}>
            1.0.0
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, textStyle, textColorStyle]}>
            Accesibilidad:
          </Text>
          <Text style={[styles.infoValue, textStyle, textColorStyle]}>
            TalkBack / VoiceOver
          </Text>
        </View>
        
        <Text style={[styles.infoText, textStyle, textColorStyle]}>
          Esta app cumple con principios de accesibilidad WCAG
          para garantizar una experiencia inclusiva.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessibilityLabel="Cerrar sesión"
        accessibilityRole="button"
        accessibilityHint="Cierra tu sesión actual"
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, textStyle, textColorStyle]}>
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
  card: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  highContrastCard: {
    backgroundColor: '#111111',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
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
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 8,
  },
  adminBadge: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  adminBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
  },
  infoBoxText: {
    fontSize: 14,
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
  },
  infoValue: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
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
    textAlign: 'center',
  },
  normalText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  largeText: {
    fontSize: 22,
  },
  highContrastText: {
    color: '#ffffff',
  },
});