
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Power, Settings } from 'lucide-react';
import { controlEraser } from '@/services/api';
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

interface EraserControlProps {
  eraserId: string;
}

const EraserControl: React.FC<EraserControlProps> = ({ eraserId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [raspberryPiUrl, setRaspberryPiUrl] = useState('http://raspberrypi.local:3000');
  const [showSettings, setShowSettings] = useState(false);
  const [isOn, setIsOn] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (turnOn: boolean) => {
    const action = turnOn ? 'on' : 'off';
    if (!action) return;
    setIsLoading(true);
    try {
      await controlEraser();
      setIsOn(turnOn);
      toast({
        title: "Success",
        description: `Eraser turned ${action} successfully`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to control eraser. Check Raspberry Pi connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Control Eraser</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {showSettings && (
          <div className="mb-4 space-y-2">
            <Label htmlFor="raspberryPiUrl">Raspberry Pi URL</Label>
            <Input
              id="raspberryPiUrl"
              value={raspberryPiUrl}
              onChange={(e) => setRaspberryPiUrl(e.target.value)}
              placeholder="http://raspberrypi.local:5000"
              className="mb-2"
            />
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700 flex items-start text-sm">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <p>Make sure your Raspberry Pi is running the server script and is accessible on your network.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-6 flex flex-col items-center">
            <Power 
              className={`h-16 w-16 ${isOn ? 'text-green-500' : 'text-gray-400'} transition-colors`} 
              strokeWidth={1.5} 
            />
            <p className="mt-2 text-lg font-medium">{isOn ? 'Eraser is ON' : 'Eraser is OFF'}</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Off</span>
            <Switch 
              checked={isOn} 
              onCheckedChange={handleToggle} 
              disabled={isLoading} 
            />
            <span className="text-sm text-gray-500">On</span>
          </div>

          <div className="flex justify-center mt-6 space-x-4">
            <Button
              variant={isOn ? "outline" : "default"}
              onClick={() => handleToggle(false)}
              disabled={isLoading || !isOn}
              className="w-24"
            >
              Turn Off
            </Button>
            <Button
              variant={!isOn ? "outline" : "default"}
              onClick={() => handleToggle(true)}
              disabled={isLoading || isOn}
              className="w-24"
            >
              Turn On
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EraserControl;
