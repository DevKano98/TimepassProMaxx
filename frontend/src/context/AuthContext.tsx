import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { loginApi } from '../api/endpoints';
import { SEED_USERS, guestStore } from '../api/seedData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuestMode: boolean;
  login: (email: string, password?: string) => Promise<User>;
  logout: () => void;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session on mount
    try {
      const storedToken = localStorage.getItem('civicguard_token');
      const storedUser = localStorage.getItem('civicguard_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load stored session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<User> => {
    setIsLoading(true);
    setIsGuestMode(false);
    try {
      const { token: receivedToken, user: receivedUser } = await loginApi(email, password);
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('civicguard_token', receivedToken);
      localStorage.setItem('civicguard_user', JSON.stringify(receivedUser));
      return receivedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const enterGuestMode = () => {
    guestStore.reset();
    setIsGuestMode(true);
    const guestUser = { ...SEED_USERS[0] };
    setUser(guestUser);
    setToken('guest-demo-token');
  };

  const exitGuestMode = () => {
    setIsGuestMode(false);
    setUser(null);
    setToken(null);
    guestStore.reset();
    localStorage.removeItem('civicguard_token');
    localStorage.removeItem('civicguard_user');
  };

  const logout = () => {
    if (isGuestMode) {
      exitGuestMode();
      return;
    }
    setToken(null);
    setUser(null);
    setIsGuestMode(false);
    localStorage.removeItem('civicguard_token');
    localStorage.removeItem('civicguard_user');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isGuestMode,
        login,
        logout,
        enterGuestMode,
        exitGuestMode,
        hasRole,
      }}
    >
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
