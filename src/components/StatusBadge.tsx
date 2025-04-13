
import React from 'react';
import { cn } from '@/lib/utils';
import { EraserStatus } from '@/types';

interface StatusBadgeProps {
  status: EraserStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfig = {
    good: {
      color: 'bg-status-good',
      text: 'Good',
    },
    warning: {
      color: 'bg-status-warning',
      text: 'Warning',
    },
    error: {
      color: 'bg-status-error',
      text: 'Error',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
        config.color,
        className
      )}
    >
      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse-slow"></span>
      {config.text}
    </span>
  );
};

export default StatusBadge;
