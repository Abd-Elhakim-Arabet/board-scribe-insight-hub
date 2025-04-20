import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface LabelDisplayProps {
  labels?: string[];
  onRemoveLabel?: (label: string) => void;
  editable?: boolean;
}

const LabelDisplay: React.FC<LabelDisplayProps> = ({ 
  labels = [], 
  onRemoveLabel,
  editable = false
}) => {
  // Define a list of preset colors for labels
  const labelColors = [
    'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'bg-green-100 text-green-800 hover:bg-green-200',
    'bg-purple-100 text-purple-800 hover:bg-purple-200',
    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    'bg-pink-100 text-pink-800 hover:bg-pink-200',
    'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    'bg-red-100 text-red-800 hover:bg-red-200',
    'bg-teal-100 text-teal-800 hover:bg-teal-200',
  ];
  
  // Assign a color to each label based on its content (consistently)
  const getLabelColor = (label: string) => {
    const index = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % labelColors.length;
    return labelColors[index];
  };

  if (!labels.length) {
    return <div className="text-sm text-gray-400 italic">No labels assigned</div>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <Badge
          key={label}
          variant="outline"
          className={`${getLabelColor(label)} border-0 px-2 py-0.5 transition-all ${editable ? 'pr-1' : ''}`}
        >
          {label}
          {editable && onRemoveLabel && (
            <button
              onClick={() => onRemoveLabel(label)}
              className="ml-1 rounded-full hover:bg-white/20 p-0.5"
              aria-label={`Remove ${label} label`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
};

export default LabelDisplay;