
import React, { useEffect, useState } from 'react';
import { BoardState } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getImageSummary, updateBoardStateDescription } from '@/services/api';
import { RefreshCw, CheckCircle, ClockIcon } from 'lucide-react';

interface BoardStateCardProps {
  boardState: BoardState;
}

const BoardStateCard: React.FC<BoardStateCardProps> = ({ boardState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(boardState.description || '');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const handleGenerateSummary = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const generatedSummary = await getImageSummary(boardState.imageUrl);
      setSummary(generatedSummary);
      await updateBoardStateDescription(boardState.id, generatedSummary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!boardState.description && boardState.imageUrl) {
      handleGenerateSummary();
    }
  }, [boardState.id]);

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-gray-100">
        <img 
          src={boardState.imageUrl} 
          alt="Whiteboard state" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to iframe if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const iframe = document.createElement('iframe');
              iframe.src = "https://drive.google.com/file/d/14hsJJjSWAXDzF8Uup_7JQz2rQRTSwPle/preview";
              iframe.width = "100%";
              iframe.height = "100%";
              iframe.allow = "autoplay";
              parent.appendChild(iframe);
            }
          }}
        />
        <div className="absolute top-2 right-2">
          {boardState.isComplete ? (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              <CheckCircle className="mr-1 h-3 w-3" />
              Complete
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              <ClockIcon className="mr-1 h-3 w-3" />
              In Progress
            </span>
          )}
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="text-sm text-gray-500 mb-2 flex items-center">
          <ClockIcon className="h-3.5 w-3.5 mr-1" />
          {formatDate(boardState.timestamp)}
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="font-medium text-sm mb-1">Summary</h4>
          {summary ? (
            <p className="text-sm text-gray-600">{summary}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No summary available.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateSummary}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Regenerate Summary'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BoardStateCard;
