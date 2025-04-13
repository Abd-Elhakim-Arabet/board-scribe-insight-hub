
import React from 'react';
import { Link } from 'react-router-dom';
import { Eraser } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from './StatusBadge';
import { Calendar, Hash } from 'lucide-react';

interface EraserCardProps {
  eraser: Eraser;
}

const EraserCard: React.FC<EraserCardProps> = ({ eraser }) => {
  return (
    <Link to={`/erasers/${eraser.id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:border-blue-300">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{eraser.name}</CardTitle>
            <StatusBadge status={eraser.status} />
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-gray-600">
            <strong>Room:</strong> {eraser.room}
          </p>
        </CardContent>
        <CardFooter className="border-t pt-2 text-xs text-gray-500">
          <div className="flex justify-between w-full">
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>Installed: {new Date(eraser.dateInstalled).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Hash className="h-3.5 w-3.5 mr-1" />
              <span>Erasures: {eraser.erasureCount}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default EraserCard;
