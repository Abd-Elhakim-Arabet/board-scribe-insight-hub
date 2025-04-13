
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEraserById, getBoardStatesByEraserId } from '@/services/api';
import { Eraser, BoardState } from '@/types';
import { ArrowLeft, Calendar, Wrench, Hash, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import BoardStateCard from '@/components/BoardStateCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const EraserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [eraser, setEraser] = useState<Eraser | null>(null);
  const [boardStates, setBoardStates] = useState<BoardState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const [eraserData, boardStateData] = await Promise.all([
          getEraserById(id),
          getBoardStatesByEraserId(id)
        ]);
        
        setEraser(eraserData);
        setBoardStates(boardStateData);
        setError(null);
      } catch (err) {
        console.error('Error fetching eraser details:', err);
        setError('Failed to load eraser details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !eraser) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
        {error || 'Eraser not found'}
        <Link to="/erasers" className="block mt-4 text-blue-600 hover:underline">
          ← Back to erasers
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/erasers" className="text-blue-600 hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to erasers
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{eraser.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Details and board history
            </p>
          </div>
          <StatusBadge status={eraser.status} className="px-3 py-1 text-sm" />
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Room Assignment</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {eraser.room}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date Installed</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div className="flex items-center">
                  <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                  {formatDate(eraser.dateInstalled)}
                </div>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Erasure Count</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div className="flex items-center">
                  <Hash className="mr-1.5 h-4 w-4 text-gray-400" />
                  {eraser.erasureCount}
                </div>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div className="flex items-center">
                  <Wrench className="mr-1.5 h-4 w-4 text-gray-400" />
                  {eraser.status === 'good' 
                    ? 'Good condition, operating normally' 
                    : eraser.status === 'warning'
                    ? 'Requires attention soon'
                    : 'Needs immediate maintenance'}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Board History</h2>
          <Button variant="outline">Refresh Data</Button>
        </div>
      </div>

      {boardStates.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No board states recorded for this eraser yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boardStates.map((boardState) => (
            <BoardStateCard key={boardState.id} boardState={boardState} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EraserDetail;
