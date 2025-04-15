import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AdminUser } from '@/services/auth';

interface AuthContextType {
  isAdmin: boolean;
  isSuper: boolean;
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerAdmin: (username: string, password: string, isSuper?: boolean) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const loggedInUser = await authService.login(username, password);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        // Store the user in localStorage for persistence
        localStorage.setItem('admin_user', JSON.stringify(loggedInUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
  };

  const registerAdmin = async (
    username: string, 
    password: string, 
    isSuper: boolean = false
  ): Promise<{ success: boolean; message?: string }> => {
    if (!user) {
      return { success: false, message: 'You must be logged in to register a new admin' };
    }
    
    return await authService.registerAdmin(user, username, password, isSuper);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAdmin: !!user, 
        isSuper: user?.isSuper || false,
        user,
        login, 
        logout,
        registerAdmin
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};