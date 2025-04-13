
import React, { useEffect, useState } from 'react';
import { getErasers } from '@/services/api';
import { Eraser } from '@/types';
import EraserCard from '@/components/EraserCard';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const [erasers, setErasers] = useState<Eraser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchErasers = async () => {
      try {
        setIsLoading(true);
        const data = await getErasers();
        setErasers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching erasers:', err);
        setError('Failed to load erasers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchErasers();
  }, []);

  // Calculate status counts for summary
  const statusCounts = {
    good: erasers.filter(eraser => eraser.status === 'good').length,
    warning: erasers.filter(eraser => eraser.status === 'warning').length,
    error: erasers.filter(eraser => eraser.status === 'error').length,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-status-good">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Good</p>
              <p className="text-2xl font-bold">{statusCounts.good}</p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
              <span className="h-4 w-4 bg-status-good rounded-full"></span>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-status-warning">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Warning</p>
              <p className="text-2xl font-bold">{statusCounts.warning}</p>
            </div>
            <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center">
              <span className="h-4 w-4 bg-status-warning rounded-full"></span>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-status-error">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Error</p>
              <p className="text-2xl font-bold">{statusCounts.error}</p>
            </div>
            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
              <span className="h-4 w-4 bg-status-error rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Erasers Overview</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow">
              <div className="p-4">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      ) : erasers.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No erasers found in the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {erasers.map((eraser) => (
            <EraserCard key={eraser.id} eraser={eraser} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
