import React, { useEffect, useRef, useState } from 'react';
import mqtt from 'mqtt';

interface EraserLogsProps {
  eraserId: string;
}

const MQTT_URL = 'wss://1c1ede3b166543d4823c1c3f26a82bad.s1.eu.hivemq.cloud:8884/mqtt';
const MQTT_OPTIONS = {
  clientId: `mqttjs_logs_${Math.random().toString(16).substr(2, 8)}`,
  username: 'board',
  password: 'Board1234',
  reconnectPeriod: 5000,
  keepalive: 60,
};

const EraserLogs: React.FC<EraserLogsProps> = ({ eraserId }) => {
  const [logs, setLogs] = useState('');
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  useEffect(() => {
    const client = mqtt.connect(MQTT_URL, MQTT_OPTIONS);
    clientRef.current = client;

    client.on('connect', () => {
      setConnected(true);
      client.subscribe(`eraser_${eraserId}/logs`, (err) => {
        if (err) {
          setLogs('Failed to subscribe to logs topic.');
        }
      });
    });

    client.on('message', (topic, message) => {
      if (topic === `eraser_${eraserId}/logs`) {
        setLogs(message.toString());
      }
    });

    client.on('error', (err) => {
      setLogs('MQTT connection error.');
      setConnected(false);
    });

    client.on('offline', () => {
      setConnected(false);
    });

    // Cleanup
    return () => {
      if (client) {
        client.unsubscribe(`eraser_${eraserId}/logs`);
        client.end(true);
      }
    };
  }, [eraserId]);

  return (
    <div className="flex flex-col h-96">
      <div className="mb-2 text-sm text-gray-500">
        {connected ? 'Live logs (auto-updating)' : 'Connecting to MQTT...'}
      </div>
      <pre className="flex-1 bg-black text-green-200 rounded p-3 overflow-auto text-xs whitespace-pre-wrap">
        {logs || 'No logs received yet.'}
      </pre>
    </div>
  );
};

export default EraserLogs;
