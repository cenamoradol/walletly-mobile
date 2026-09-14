import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const hasToken = await AuthService.loadToken();
      setIsLoggedIn(hasToken);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string) => {
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AuthService.logout();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
