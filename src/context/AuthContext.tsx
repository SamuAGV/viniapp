import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getCurrentUser, initDefaultUsers, loginUser, logoutUser } from '../storage/storage';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initialize = async () => {
      await initDefaultUsers();
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    initialize();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const loggedUser = await loginUser(email, password);
    if (loggedUser) {
      setUser(loggedUser);
      return true;
    }
    return false;
  };

  const logout = async (): Promise<void> => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};