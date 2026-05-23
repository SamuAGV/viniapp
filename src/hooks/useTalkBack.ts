import * as Speech from 'expo-speech';
import { useCallback, useRef } from 'react';
import { GestureResponderEvent, PanResponder } from 'react-native';

interface TalkBackOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  enabled?: boolean;
  onToggle?: () => void;
}

export const useTalkBack = (options: TalkBackOptions = {}) => {
  const {
    language = 'es-ES',
    pitch = 1.0,
    rate = 0.9,
    enabled = true,
    onToggle,
  } = options;

  const speak = useCallback((text: string, immediate: boolean = true) => {
    if (!enabled) return;
    
    if (immediate) {
      Speech.stop();
    }
    Speech.speak(text, {
      language,
      pitch,
      rate,
    });
  }, [language, pitch, rate, enabled]);

  const announceScreen = useCallback((screenName: string) => {
    if (!enabled) return;
    speak(`Pantalla de ${screenName}. Navega usando los tabs o deslizando con dos dedos.`);
  }, [speak, enabled]);

  const announceAction = useCallback((action: string, result?: string) => {
    if (!enabled) return;
    const message = result ? `${action}: ${result}` : action;
    speak(message);
  }, [speak, enabled]);

  const announceError = useCallback((errorMessage: string) => {
    if (!enabled) return;
    speak(`Error: ${errorMessage}. Por favor intenta nuevamente.`);
  }, [speak, enabled]);

  const announceSuccess = useCallback((message: string) => {
    if (!enabled) return;
    speak(`Éxito: ${message}`);
  }, [speak, enabled]);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
  }, []);

  // Detectar gesto de "L" en la pantalla
  const detectLShape = (points: { x: number, y: number }[]) => {
    if (points.length < 3) return false;
    
    // Detecta un movimiento horizontal (primer trazo de la L)
    const firstHorizontal = Math.abs(points[1].x - points[0].x) > Math.abs(points[1].y - points[0].y);
    // Detecta un movimiento vertical (segundo trazo de la L)
    const secondVertical = Math.abs(points[2].x - points[1].x) < Math.abs(points[2].y - points[1].y);
    
    return firstHorizontal && secondVertical;
  };

  const gesturePoints = useRef<{ x: number, y: number }[]>([]);
  const gestureTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      gesturePoints.current = [{ x: locationX, y: locationY }];
      
      if (gestureTimeout.current) {
        clearTimeout(gestureTimeout.current);
        gestureTimeout.current = null;
      }
    },
    onPanResponderMove: (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      gesturePoints.current.push({ x: locationX, y: locationY });
      
      // Mantener solo los últimos 5 puntos
      if (gesturePoints.current.length > 5) {
        gesturePoints.current.shift();
      }
    },
    onPanResponderRelease: () => {
      if (detectLShape(gesturePoints.current)) {
        if (onToggle) {
          onToggle();
          if (enabled) {
            speak('TalkBack desactivado');
          } else {
            speak('TalkBack activado. Puedes navegar usando gestos. Traza una L en la pantalla para desactivar.');
          }
        }
      }
      gesturePoints.current = [];
      
      if (gestureTimeout.current) {
        clearTimeout(gestureTimeout.current);
      }
      gestureTimeout.current = setTimeout(() => {
        gesturePoints.current = [];
        gestureTimeout.current = null;
      }, 1000);
    },
  });

  return {
    speak,
    announceScreen,
    announceAction,
    announceError,
    announceSuccess,
    stopSpeaking,
    isSpeaking: Speech.isSpeakingAsync,
    panResponder,
    enabled,
  };
};