
import React, { useEffect, useState } from 'react';
import { getErasers } from '@/services/api';
import { Eraser } from '@/types';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Erasers = () => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Smart Erasers</h1>
        <Button>Add New Eraser</Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {erasers.map((eraser) => (
              <li key={eraser.id}>
                <Link
                  to={`/erasers/${eraser.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-lg font-medium text-blue-600 mr-2">
                          {eraser.name}
                        </p>
                        <StatusBadge id={eraser.id} />
                      </div>
                      <div className="text-sm text-gray-500">
                        Room: <span className="font-medium">{eraser.room}</span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="flex items-center text-sm text-gray-500 mr-6">
                          <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                          Installed: {formatDate(eraser.dateInstalled)}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Hash className="mr-1.5 h-4 w-4 text-gray-400" />
                          Erasures: {eraser.erasureCount}
                        </div>
                      </div>
                      {eraser.lastActive && (
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Last active:{' '}
                            <time dateTime={eraser.lastActive}>
                              {new Date(eraser.lastActive).toLocaleString()}
                            </time>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Erasers;
