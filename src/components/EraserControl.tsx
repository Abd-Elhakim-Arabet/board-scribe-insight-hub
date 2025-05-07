import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Eraser, Power, RefreshCw, Settings } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import mqtt from 'mqtt';

interface EraserControlProps {
  eraserId: string;
}

const EraserControl: React.FC<EraserControlProps> = ({ eraserId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('offline');
  const clientRef = useRef(null);
  const { toast } = useToast();

  // Handle incoming MQTT messages
  const handleMessage = useCallback((topic: string, message: Buffer) => {
    const messageStr = message.toString();
    
    // Handle device status updates
    if (topic === `eraser_${eraserId}/status`) {
      setDeviceStatus(messageStr.toLowerCase());
      console.log('Received status message:', messageStr);
    }
    
    // Handle command responses
    if (topic === `eraser_${eraserId}/response`) {
      console.log('Received response:', messageStr);
      try {
        const response = JSON.parse(messageStr);
        toast({
          title: response.success ? "Success" : "Error",
          description: response.message || "Command processed",
        });
      } catch (e) {
        // If not JSON, just show the message
        toast({
          title: "Response",
          description: messageStr,
        });
      }
      setIsLoading(false);
    }
  }, [eraserId, toast]);

  useEffect(() => {
    console.log('Setting up MQTT connection for eraser control');
    
    // Create client inside useEffect to ensure it only happens once
    const client = mqtt.connect('wss://1c1ede3b166543d4823c1c3f26a82bad.s1.eu.hivemq.cloud:8884/mqtt', {
      clientId: `mqttjs_control_${Math.random().toString(16).substr(2, 8)}`,
      username: 'board',
      password: 'Board1234',
      reconnectPeriod: 5000,
      keepalive: 60,
    });
    
    clientRef.current = client;

    client.on('connect', () => {
      console.log('Connected to MQTT broker for eraser control');
      // Subscribe to status and response topics
      client.subscribe([`eraser_${eraserId}/status`, `eraser_${eraserId}/response`], (err) => {
        if (err) {
          console.error('Subscription error:', err);
        } else {
          console.log(`Subscribed to eraser topics for ID: ${eraserId}`);
        }
      });
    });

    client.on('error', (err) => {
      console.error('MQTT connection error:', err);
      setDeviceStatus('offline');
    });

    client.on('offline', () => {
      console.log('MQTT client is offline');
      setDeviceStatus('offline');
    });

    client.on('message', handleMessage);

    // Cleanup function
    return () => {
      console.log('Cleaning up MQTT connection');
      if (client) {
        client.off('message', handleMessage);
        client.unsubscribe([`eraser_${eraserId}/status`, `eraser_${eraserId}/response`]);
        client.end(true);
      }
    };
  }, [eraserId, handleMessage]);

  const sendCommand = (command) => {
    if (!clientRef.current || deviceStatus === 'offline') {
      toast({
        title: "Error",
        description: "Device is offline. Cannot send command.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const topic = `eraser_${eraserId}/command`;
    clientRef.current.publish(topic, command, (err) => {
      if (err) {
        console.error('Failed to publish command:', err);
        toast({
          title: "Error",
          description: "Failed to send command to device",
          variant: "destructive",
        });
        setIsLoading(false);
      } else {
        console.log(`Published command ${command} to ${topic}`);
      }
    });
  };

  const handleCapture = () => sendCommand('capture');
  const handleErase = () => sendCommand('erase');
  const handleCaptureAndErase = () => sendCommand('capture_erase');

  const isOnline = deviceStatus === 'online';

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Control Eraser</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-6 flex flex-col items-center">
            <Power 
              className={`h-16 w-16 ${isOnline ? 'text-green-500' : 'text-red-500'} transition-colors`} 
              strokeWidth={1.5} 
            />
            <p className="mt-2 text-lg font-medium">
              {isOnline ? 'Device Online' : 'Device Offline'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <Button
              variant="outline"
              onClick={handleCapture}
              disabled={isLoading || !isOnline}
              className="flex items-center justify-center"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture Image
            </Button>
            
            <Button
              variant="outline"
              onClick={handleErase}
              disabled={isLoading || !isOnline}
              className="flex items-center justify-center"
            >
              <Eraser className="mr-2 h-4 w-4" />
              Erase Board
            </Button>
            
            <Button
              variant="default"
              onClick={handleCaptureAndErase}
              disabled={isLoading || !isOnline}
              className="flex items-center justify-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Capture & Erase
            </Button>
          </div>

          {isLoading && (
            <div className="mt-4 text-sm text-gray-500">
              Processing command...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EraserControl;
