import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEraserById, getBoardStatesByEraserId, availableLabels } from '@/services/api';
import { Eraser, BoardState } from '@/types';
import { ArrowLeft, Calendar, Hash, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import BoardStateCard from '@/components/BoardStateCard';
import EraserControl from '@/components/EraserControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EraserLogs from '@/components/EraserLogs';
import { Calendar as DateRangeCalendar } from '@/components/ui/calendar';

const EraserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [eraser, setEraser] = useState<Eraser | null>(null);
  const [boardStates, setBoardStates] = useState<BoardState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({ from: undefined, to: undefined });
  const [labelFilter, setLabelFilter] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  // Filtering logic
  const filteredBoardStates = boardStates.filter((state) => {
    // Date filter
    const stateDate = new Date(state.timestamp);
    const inDateRange = (!dateRange.from || stateDate >= dateRange.from) && (!dateRange.to || stateDate <= dateRange.to);
    // Label filter
    const hasLabels = labelFilter.length === 0 || (state.labels && labelFilter.every(l => state.labels.includes(l)));
    return inDateRange && hasLabels;
  });

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

      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="control">Control</TabsTrigger>
          <TabsTrigger value="history">Board History</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{eraser.name}</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Details and board history
                </p>
              </div>
              <StatusBadge id={eraser.id} />
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
        </TabsContent>
        <TabsContent value="control">
          <EraserControl eraserId={eraser.id} />
        </TabsContent>
        <TabsContent value="history">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-80 flex-shrink-0 bg-white border rounded p-4 h-fit">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              {/* Date Range Filter */}
              <div className="mb-6">
                <label className="block text-xs font-medium mb-1">Filter by Date</label>
                <div className="max-w-full overflow-x-auto">
                  <DateRangeCalendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                  />
                </div>
              </div>
              {/* Label Filter */}
              <div className="mb-6">
                <label className="block text-xs font-medium mb-1">Filter by Labels</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableLabels.map(label => (
                    <button
                      key={label}
                      className={`px-2 py-1 rounded text-xs border ${labelFilter.includes(label) ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-gray-300 text-gray-600'}`}
                      onClick={() => setLabelFilter(lf => lf.includes(label) ? lf.filter(l => l !== label) : [...lf, label])}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => { setDateRange({ from: undefined, to: undefined }); setLabelFilter([]); }}>Clear Filters</Button>
            </aside>
            {/* Board State List */}
            <main className="flex-1">
              {filteredBoardStates.length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No board states match the selected filters.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredBoardStates.map((boardState) => (
                    <div key={boardState.id} className="border rounded shadow-sm bg-white">
                      <button
                        className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-gray-50 focus:outline-none"
                        onClick={() => setExpandedId(expandedId === boardState.id ? null : boardState.id)}
                      >
                        <span className="font-medium text-sm flex-1 text-left">{formatDate(boardState.timestamp)}</span>
                        <span className="flex gap-1 ml-2">
                          {(boardState.labels || []).map(label => (
                            <span key={label} className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">{label}</span>
                          ))}
                        </span>
                        <span className="ml-4 text-xs text-gray-400">{expandedId === boardState.id ? '▲' : '▼'}</span>
                      </button>
                      {expandedId === boardState.id && (
                        <div className="p-4 border-t bg-gray-50">
                          <BoardStateCard boardState={boardState} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </TabsContent>
        <TabsContent value="logs">
          <EraserLogs eraserId={eraser.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EraserDetail;
