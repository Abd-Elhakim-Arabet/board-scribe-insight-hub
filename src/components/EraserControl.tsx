
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Square, Settings } from 'lucide-react';
import { controlEraser } from '@/services/api';
import { useToast } from "@/components/ui/use-toast";

interface EraserControlProps {
  eraserId: string;
}

const EraserControl: React.FC<EraserControlProps> = ({ eraserId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [raspberryPiUrl, setRaspberryPiUrl] = useState('http://raspberrypi.local:5000');
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const handleControl = async (action: string) => {
    setIsLoading(true);
    try {
      await controlEraser(action, raspberryPiUrl);
      toast({
        title: "Success",
        description: `Eraser ${action} command sent successfully`,
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

        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <Button
            variant="outline"
            onClick={() => handleControl('forward')}
            disabled={isLoading}
            className="flex flex-col items-center py-3"
          >
            <ArrowUp className="h-5 w-5" />
            <span className="mt-1 text-xs">Forward</span>
          </Button>
          <div></div>

          <Button
            variant="outline"
            onClick={() => handleControl('left')}
            disabled={isLoading}
            className="flex flex-col items-center py-3"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="mt-1 text-xs">Left</span>
          </Button>
          
          <Button
            variant={isLoading ? "outline" : "default"}
            onClick={() => handleControl('stop')}
            disabled={isLoading}
            className="flex flex-col items-center py-3"
          >
            <Square className="h-5 w-5" />
            <span className="mt-1 text-xs">Stop</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleControl('right')}
            disabled={isLoading}
            className="flex flex-col items-center py-3"
          >
            <ArrowRight className="h-5 w-5" />
            <span className="mt-1 text-xs">Right</span>
          </Button>

          <div></div>
          <Button
            variant="outline"
            onClick={() => handleControl('backward')}
            disabled={isLoading}
            className="flex flex-col items-center py-3"
          >
            <ArrowDown className="h-5 w-5" />
            <span className="mt-1 text-xs">Back</span>
          </Button>
          <div></div>
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => handleControl('start_sequence')}
            disabled={isLoading}
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" />
            Run Cleaning Sequence
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EraserControl;
