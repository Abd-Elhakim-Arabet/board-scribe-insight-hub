import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const AdminRegistration: React.FC = () => {
  const { isAdmin, isSuper, registerAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Only super admins can access this component
  if (!isAdmin || !isSuper) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          Only super administrators can register new administrators.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    // Validate inputs
    if (!username || !password) {
      setMessage({ type: 'error', text: 'Username and password are required' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setIsRegistering(true);
    
    try {
      const result = await registerAdmin(username, password, isSuperAdmin);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Administrator registered successfully' });
        // Reset form
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setIsSuperAdmin(false);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to register administrator' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Register New Administrator</CardTitle>
        <CardDescription>
          Create a new account for administrative access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-4">
            {message.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isSuperAdmin" 
              checked={isSuperAdmin}
              onCheckedChange={(checked) => setIsSuperAdmin(checked === true)}
            />
            <Label htmlFor="isSuperAdmin" className="cursor-pointer">
              Grant Super Admin privileges
            </Label>
          </div>
          
          <CardFooter className="px-0 pt-4">
            <Button type="submit" disabled={isRegistering} className="w-full">
              {isRegistering ? 'Registering...' : 'Register Administrator'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};