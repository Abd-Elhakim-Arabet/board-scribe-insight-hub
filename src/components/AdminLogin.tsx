import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { isAdmin, user, login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid credentials');
      } else {
        setShowForm(false);
        setUsername('');
        setPassword('');
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowForm(false);
  };

  if (isAdmin && user) {
    return (
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">{user.username}</span>
            {user.isSuper && (
              <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                Super Admin
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-auto p-4 border-t">
      {showForm ? (
        <form onSubmit={handleLogin} className="space-y-2">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="text-sm"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-sm"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-between">
            <Button type="submit" size="sm" disabled={isLoggingIn}>
              Login
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => setShowForm(true)}
        >
          <LogIn className="h-4 w-4 mr-1" /> Admin Login
        </Button>
      )}
    </div>
  );
};