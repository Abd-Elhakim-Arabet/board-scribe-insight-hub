import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tag, RefreshCw } from 'lucide-react';
import LabelDisplay from './LabelDisplay';
import { availableLabels, classifyContent, updateBoardStateLabels } from '@/services/api';

interface LabelManagerProps {
  boardStateId: string;
  content: string;
  initialLabels?: string[];
  onLabelsUpdated?: (labels: string[]) => void;
}

const LabelManager: React.FC<LabelManagerProps> = ({
  boardStateId,
  content,
  initialLabels = [],
  onLabelsUpdated,
}) => {
  const [labels, setLabels] = useState<string[]>(initialLabels);
  const [isClassifying, setIsClassifying] = useState(false);

  // Update labels when initialLabels prop changes
  useEffect(() => {
    setLabels(initialLabels);
  }, [initialLabels]);

  const handleClassifyContent = async () => {
    if (!content || isClassifying) return;
    
    setIsClassifying(true);
    try {
      const classifiedLabels = await classifyContent(content);
      setLabels(classifiedLabels);
      await updateBoardStateLabels(boardStateId, classifiedLabels);
      if (onLabelsUpdated) onLabelsUpdated(classifiedLabels);
    } catch (error) {
      console.error('Failed to classify content:', error);
    } finally {
      setIsClassifying(false);
    }
  };
  
  const handleRemoveAssignedLabel = (label: string) => {
    const updatedLabels = labels.filter(l => l !== label);
    setLabels(updatedLabels);
    updateBoardStateLabels(boardStateId, updatedLabels)
      .then(() => {
        if (onLabelsUpdated) onLabelsUpdated(updatedLabels);
      })
      .catch(error => {
        console.error('Failed to update assigned labels:', error);
      });
  };
  
  const handleAssignLabel = (label: string) => {
    if (!labels.includes(label)) {
      const updatedLabels = [...labels, label];
      setLabels(updatedLabels);
      updateBoardStateLabels(boardStateId, updatedLabels)
        .then(() => {
          if (onLabelsUpdated) onLabelsUpdated(updatedLabels);
        })
        .catch(error => {
          console.error('Failed to update assigned labels:', error);
        });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-medium text-sm flex items-center">
            <Tag className="h-4 w-4 mr-1.5" /> Labels
          </h4>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClassifyContent}
              disabled={isClassifying}
              className="h-7 text-xs"
            >
              {isClassifying ? (
                <>
                  <RefreshCw className="mr-1.5 h-3 w-3 animate-spin" />
                  Classifying...
                </>
              ) : (
                'Auto Label'
              )}
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <LabelDisplay
            labels={labels}
            onRemoveLabel={handleRemoveAssignedLabel}
            editable={true}
          />
          
          <div className="mt-3">
            <label className="text-sm text-gray-500 mb-1.5 block">Add labels from available options</label>
            <div className="flex flex-wrap gap-1.5">
              {availableLabels
                .filter(label => !labels.includes(label))
                .map(label => (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2 py-0"
                    onClick={() => handleAssignLabel(label)}
                  >
                    + {label}
                  </Button>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelManager;