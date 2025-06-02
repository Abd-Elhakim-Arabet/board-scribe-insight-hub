import React, { useEffect, useState, useRef } from 'react';
import { getEraserLogs, EraserLog, supabase } from '@/services/api';

interface EraserLogsProps {
  eraserId: string;
}

const EraserLogs: React.FC<EraserLogsProps> = ({ eraserId }) => {
  const [logs, setLogs] = useState<EraserLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    setLoading(true);
    getEraserLogs(eraserId)
      .then((data) => {
        setLogs(data);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load logs');
        setLogs([]);
      })
      .finally(() => setLoading(false));

    // Subscribe to real-time changes
    const channel = supabase
      .channel('eraser-logs-listen')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Listen only for new logs
          schema: 'public',
          table: 'EraserLogs',
          filter: `eraserId=eq.${eraserId}`,
        },
        (payload) => {
          console.log('Realtime payload:', payload);
          getEraserLogs(eraserId).then(setLogs);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'EraserLogs',
          filter: `eraserId=eq.${eraserId}`,
        },
        (payload) => {
          console.log('Realtime DELETE payload:', payload);
          getEraserLogs(eraserId).then(setLogs);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'EraserLogs',
          filter: `eraserId=eq.${eraserId}`,
        },
        (payload) => {
          console.log('Realtime UPDATE payload:', payload);
          getEraserLogs(eraserId).then(setLogs);
        }
      )
      .subscribe((status) => {
        console.log('Supabase channel status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [eraserId]);

  // Scroll to bottom when logs change
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-96">
      <div className="mb-2 text-sm text-gray-500">
        {loading ? 'Loading logs...' : error ? error : `Last ${logs.length} logs (most recent first)`}
      </div>
      <pre
        ref={logsEndRef}
        className="flex-1 bg-black text-green-200 rounded p-3 overflow-auto text-xs whitespace-pre-wrap"
      >
        {logs.length === 0 && !loading ? 'No logs found.' :
          logs.slice().reverse().map(log => `${new Date(log.timestamp).toLocaleString()} | ${log.message}`).join('\n')}
      </pre>
    </div>
  );
};

export default EraserLogs;
