export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';  // Añadir rol
    createdAt?: string;
  }
  
  export interface Record {
    id: string;
    title: string;
    description: string;
    createdAt?: string;
    userId?: string;  // Para saber qué usuario creó el registro
    userName?: string; // Nombre del usuario que creó el registro
  }
  
  export interface AccessibilitySettings {
    highContrast: boolean;
    largeText: boolean;
  }
  
  export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    loading: boolean;
  }