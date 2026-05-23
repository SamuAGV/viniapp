import * as Speech from 'expo-speech';
import { useCallback } from 'react';

interface TalkBackOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  enabled?: boolean;
}

export const useTalkBack = (options: TalkBackOptions = {}) => {
  const {
    language = 'es-ES',
    pitch = 1.0,
    rate = 0.9,
    enabled = true,
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

  return {
    speak,
    announceScreen,
    announceAction,
    announceError,
    announceSuccess,
    stopSpeaking,
    isSpeaking: Speech.isSpeakingAsync,
    enabled,
  };
};