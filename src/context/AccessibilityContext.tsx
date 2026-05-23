import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  largeText: boolean;
  talkBackEnabled: boolean;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleTalkBack: () => void;
  setTalkBackEnabled: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// Claves SIN el símbolo @
const HIGH_CONTRAST_KEY = 'app_high_contrast';
const LARGE_TEXT_KEY = 'app_large_text';
const TALKBACK_KEY = 'app_talkback_enabled';

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [talkBackEnabled, setTalkBackEnabledState] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const contrast = await SecureStore.getItemAsync(HIGH_CONTRAST_KEY);
      const text = await SecureStore.getItemAsync(LARGE_TEXT_KEY);
      const talkback = await SecureStore.getItemAsync(TALKBACK_KEY);
      
      setHighContrast(contrast === 'true');
      setLargeText(text === 'true');
      setTalkBackEnabledState(talkback === 'true');
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await SecureStore.setItemAsync(key, value.toString());
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const toggleHighContrast = async () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    await saveSetting(HIGH_CONTRAST_KEY, newValue);
  };

  const toggleLargeText = async () => {
    const newValue = !largeText;
    setLargeText(newValue);
    await saveSetting(LARGE_TEXT_KEY, newValue);
  };

  const toggleTalkBack = async () => {
    const newValue = !talkBackEnabled;
    setTalkBackEnabledState(newValue);
    await saveSetting(TALKBACK_KEY, newValue);
  };

  const setTalkBackEnabled = async (enabled: boolean) => {
    setTalkBackEnabledState(enabled);
    await saveSetting(TALKBACK_KEY, enabled);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        largeText,
        talkBackEnabled,
        toggleHighContrast,
        toggleLargeText,
        toggleTalkBack,
        setTalkBackEnabled,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};