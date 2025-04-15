import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminRegistration } from '@/components/AdminRegistration';

const Settings = () => {
  const { isAdmin, isSuper } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      {/* Admin Registration - Only shown to super admins */}
      {isAdmin && isSuper && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Administrator Management</h2>
          <AdminRegistration />
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure the connection to your image summarization API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">Python API URL</Label>
              <Input id="apiUrl" placeholder="http://localhost:5000/api/summarize" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (if required)</Label>
              <Input id="apiKey" type="password" placeholder="••••••••••••••••" />
            </div>
            <Button className="w-full sm:w-auto">Save API Configuration</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Storage Settings</CardTitle>
          <CardDescription>
            Configure Google Drive connection for board images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driveId">Google Drive Folder ID</Label>
              <Input id="driveId" placeholder="1xYz_AbCdEfGhIjKlMnOpQrStUvWxYz" />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700 flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">
                Make sure you have shared the Google Drive folder with the service account or granted appropriate access permissions.
              </p>
            </div>
            <Button className="w-full sm:w-auto">Connect to Google Drive</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Database Connection</CardTitle>
          <CardDescription>
            Your Supabase database connection information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                Your application is connected to Supabase. Database tables and schemas 
                can be managed directly through the Supabase dashboard.
              </p>
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              Open Supabase Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
