import React, { useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTalkBack } from '../hooks/useTalkBack';

interface VoiceCommandsProps {
  onNavigate?: (screen: string) => void;
  onAction?: (action: string) => void;
  currentScreen?: string;
}

export const VoiceCommands: React.FC<VoiceCommandsProps> = ({
  onNavigate,
  onAction,
  currentScreen,
}) => {
  const { speak, announceAction } = useTalkBack({ enabled: true });
  const { highContrast, largeText } = useAccessibility();
  const [modalVisible, setModalVisible] = useState(false);
  const [listening, setListening] = useState(false);

  const commands = {
    navegacion: {
      'ir a inicio': () => onNavigate?.('home'),
      'ir a registros': () => onNavigate?.('records'),
      'ir a perfil': () => onNavigate?.('profile'),
      'volver atrás': () => onNavigate?.('back'),
    },
    acciones: {
      'nuevo registro': () => onAction?.('new'),
      'crear registro': () => onAction?.('new'),
      'ayuda': () => showHelp(),
      'qué puedo hacer': () => showHelp(),
    },
  };

  const showHelp = () => {
    const helpMessage = `Comandos disponibles: 
      Navegación: ir a inicio, ir a registros, ir a perfil.
      Acciones: nuevo registro, crear registro, ayuda.`;
    speak(helpMessage);
    Alert.alert('Comandos disponibles', helpMessage);
  };

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    
    for (const [key, action] of Object.entries(commands.navegacion)) {
      if (lowerCommand.includes(key)) {
        announceAction(`Navegando a ${key}`);
        action();
        return;
      }
    }
    
    for (const [key, action] of Object.entries(commands.acciones)) {
      if (lowerCommand.includes(key)) {
        announceAction(`Ejecutando ${key}`);
        action();
        return;
      }
    }
    
    speak('Comando no reconocido. Di "ayuda" para ver los comandos disponibles.');
  };

  const startListening = () => {
    setListening(true);
    speak('Escuchando. Di un comando. Para cancelar, presiona nuevamente el micrófono.');
    
    setTimeout(() => {
      setListening(false);
      setModalVisible(true);
    }, 2000);
  };

  const textStyle = largeText ? styles.largeText : styles.normalText;
  const buttonStyle = highContrast ? styles.highContrastMicButton : styles.micButton;
  const modalStyle = highContrast ? styles.highContrastModalContent : styles.modalContent;
  const textColorStyle = highContrast ? styles.highContrastText : styles.normalText;

  return (
    <>
      <TouchableOpacity
        style={buttonStyle}
        onPress={startListening}
        accessibilityLabel="Activar comandos de voz"
        accessibilityHint="Presiona para decir un comando de voz"
        accessibilityRole="button"
      >
        <Icon name="mic" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={modalStyle}>
            <Text style={[styles.modalTitle, textStyle, textColorStyle]}>Comandos de Voz Rápidos</Text>
            <Text style={[styles.modalSubtitle, textStyle, textColorStyle]}>
              Presiona un botón o di el comando en voz alta
            </Text>
            
            <Text style={[styles.commandSection, textStyle, textColorStyle]}>Navegación:</Text>
            <TouchableOpacity
              style={styles.commandButton}
              onPress={() => {
                setModalVisible(false);
                processVoiceCommand('ir a inicio');
              }}
            >
              <Text style={[styles.commandText, textStyle]}>Ir a Inicio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.commandButton}
              onPress={() => {
                setModalVisible(false);
                processVoiceCommand('ir a registros');
              }}
            >
              <Text style={[styles.commandText, textStyle]}>Ir a Registros</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.commandButton}
              onPress={() => {
                setModalVisible(false);
                processVoiceCommand('ir a perfil');
              }}
            >
              <Text style={[styles.commandText, textStyle]}>Ir a Perfil</Text>
            </TouchableOpacity>
            
            <Text style={[styles.commandSection, textStyle, textColorStyle]}>Acciones:</Text>
            <TouchableOpacity
              style={styles.commandButton}
              onPress={() => {
                setModalVisible(false);
                processVoiceCommand('nuevo registro');
              }}
            >
              <Text style={[styles.commandText, textStyle]}>Nuevo Registro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.commandButton}
              onPress={() => {
                setModalVisible(false);
                showHelp();
              }}
            >
              <Text style={[styles.commandText, textStyle]}>Ayuda</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {listening && (
        <View style={styles.listeningOverlay}>
          <View style={styles.listeningCard}>
            <Icon name="mic" size={48} color="#3498db" />
            <Text style={[styles.listeningText, textStyle]}>Escuchando...</Text>
            <Text style={[styles.listeningHint, textStyle]}>
              Di un comando como "ir a inicio" o "nuevo registro"
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  micButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
  highContrastMicButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff0000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    zIndex: 999,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  highContrastModalContent: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  commandSection: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  commandButton: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  commandText: {
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listeningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  listeningCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  listeningText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  listeningHint: {
    fontSize: 14,
    marginTop: 8,
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