import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import mqtt from 'mqtt';

interface StatusBadgeProps {
  id: string;
}



const StatusBadge: React.FC<StatusBadgeProps> = ({ id }) => {
  const [status, setStatus] = useState('offline');
  const clientRef = useRef(null);

  const handleMessage = useCallback((topic: string, message: Buffer) => {
    if (topic === `eraser_${id}/status`) {
      const statusMessage = message.toString();
      setStatus(statusMessage.toLowerCase());
      console.log('Received status message:', statusMessage);
    }
  }, [id]);

  useEffect(() => {
    console.log('Setting up MQTT subscription');
    
    // Create client inside useEffect to ensure it only happens once
    const client = mqtt.connect('wss://1c1ede3b166543d4823c1c3f26a82bad.s1.eu.hivemq.cloud:8884/mqtt', {
      clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`, // Generate random client ID to avoid conflicts
      username: 'board',
      password: 'Board1234',
      reconnectPeriod: 5000, // Reconnect every 5 seconds if connection is lost
      keepalive: 60,
    });
    
    clientRef.current = client;

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      client.subscribe(`eraser_${id}/status`, (err) => {
        if (err) {
          console.error('Subscription error:', err);
        } else {
          console.log(`Subscribed to topic: eraser_${id}/status`);
        }
      });
    });

    client.on('error', (err) => {
      console.error('MQTT connection error:', err);
      setStatus('offline');
    });

    client.on('offline', () => {
      console.log('MQTT client is offline');
      setStatus('offline');
    });

    client.on('reconnect', () => {
      console.log('Attempting to reconnect to MQTT broker');
    });

    client.on('message', handleMessage);

    // Cleanup function
    return () => {
      console.log('Cleaning up MQTT subscription');
      if (client) {
        client.off('message', handleMessage);
        client.unsubscribe(`eraser_${id}/status`);
        client.end(true); // Force disconnect
      }
    };
  }, []); // Empty dependency array ensures this only runs once

  const statusConfig = {
    online: {
      color: 'bg-green-500',
      text: 'Online',
    },
    offline: {
      color: 'bg-red-500',
      text: 'Offline',
    },
  };

  const config = statusConfig[status] || statusConfig.offline;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
        config.color
      )}
    >
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse-slow"></span>
      {config.text}
    </span>
  );
};

export default StatusBadge;
