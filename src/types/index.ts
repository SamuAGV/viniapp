export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
  }
  
  export interface Record {
    id: string;
    title: string;
    description: string;
    createdAt?: string;
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