import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEraserById, getBoardStatesByEraserId, availableLabels, getSessions, getSessionChildren, getBoardStateById } from '@/services/api';
import { Eraser, BoardState, Session } from '@/types';
import { ArrowLeft, Calendar, Hash, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import BoardStateCard from '@/components/BoardStateCard';
import EraserControl from '@/components/EraserControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EraserLogs from '@/components/EraserLogs';
import { Calendar as DateRangeCalendar } from '@/components/ui/calendar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const EraserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [eraser, setEraser] = useState<Eraser | null>(null);
  const [boardStates, setBoardStates] = useState<BoardState[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionChildren, setSessionChildren] = useState<Record<number, any[]>>({}); // New state for session children
  const [boardStateDetails, setBoardStateDetails] = useState<Record<number, BoardState>>({}); // New state for board state details
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date } | undefined>(undefined);
  const [labelFilter, setLabelFilter] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null); // Changed type to string

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

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    const fetchSessionChildren = async () => {
      try {
        const childrenPromises = sessions.map(session => getSessionChildren(session.id));
        const childrenData = await Promise.all(childrenPromises);
        const sessionChildrenMap = sessions.reduce((acc, session, index) => {
          acc[session.id] = childrenData[index];
          return acc;
        }, {} as Record<number, any[]>);
        setSessionChildren(sessionChildrenMap);
      } catch (err) {
        console.error('Error fetching session children:', err);
      }
    };

    fetchSessionChildren();
  }, [sessions]);

  useEffect(() => {
    const fetchBoardStateDetails = async () => {
        try {
            console.log('Fetching board state details for session children:', sessionChildren);
            const boardStatePromises = Object.keys(sessionChildren).flatMap(sessionId => 
                sessionChildren[sessionId].map(child => getBoardStateById(child.state))
            );
            const boardStateData = await Promise.all(boardStatePromises);
            console.log('Fetched board state data:', boardStateData);
            const boardStateDetailsMap = boardStateData.reduce((acc, boardState) => {
                if (boardState) acc[boardState.id] = boardState;
                return acc;
            }, {});
            setBoardStateDetails(boardStateDetailsMap);
          } catch (err) {
            console.error('Error fetching board state details:', err);
        }
    };

    if (Object.keys(sessionChildren).length > 0) {
        fetchBoardStateDetails();
    }
}, [sessionChildren]);

  const formatDate = (dateString: string, asTime: boolean = false) => {
    const date = new Date(dateString);
    return asTime ? date.toLocaleTimeString() : date.toLocaleDateString();
  };

  const filteredBoardStates = boardStates.filter((state) => {
    const stateDate = new Date(state.timestamp);
    const inDateRange = !dateRange?.from || (stateDate >= dateRange.from && (!dateRange.to || stateDate <= dateRange.to));
    const hasLabels = labelFilter.length === 0 || (state.labels && labelFilter.every(l => state.labels.includes(l)));
    return inDateRange && hasLabels;
  });

  const filteredBoardStatesBySession = (sessionId: number) => {
    return filteredBoardStates.filter((state) => state.session === sessionId);
  };

  const filteredSessions = sessions.filter(session => session.ended_at); // Filter sessions with a set enddate

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
              <Button variant="outline" size="sm" className="w-full" onClick={() => { setDateRange(undefined); setLabelFilter([]); }}>Clear Filters</Button>
            </aside>
            {/* Session List */}
            <main className="flex-1">
              {filteredSessions.length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No sessions available.</p>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="single" collapsible>
                  {filteredSessions.map((session) => (
                    <AccordionItem key={session.id} value={session.id.toString()}>
                      <AccordionTrigger>
                        <span className="font-medium text-sm flex-1 text-left">
                          {formatDate(session.started_at)}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="prose max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-2xl font-bold" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-xl font-semibold" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-lg font-medium" {...props} />,
                              p: ({ node, ...props }) => <p className="text-sm text-gray-700 leading-relaxed" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc list-inside" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal list-inside" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                              a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                              code: ({ node, ...props }) => <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded" {...props} />,
                            }}
                          >
                            {session.summary || 'No description available'}
                          </ReactMarkdown>
                        </div>
                        <Accordion type="single" collapsible>
                          {sessionChildren[session.id]?.map((child) => (
                            <AccordionItem key={child.id} value={child.id.toString()}>
                              {/* {(() => {
                                const boardState = filteredBoardStatesBySession(session.id).find(state => state.id === child.state);
                                if (!boardState) return null;
                                return (
                                  <>
                                  <AccordionTrigger className="flex items-center justify-between">
                                    {formatDate(boardState.timestamp)}
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    {boardStateDetails[child.id] ? (
                                      <BoardStateCard boardState={boardStateDetails[child.id]} />
                                    ) : (
                                      <p>Loading details...</p>
                                    )}
                                  </AccordionContent>
                                  </>
                                );
                              })()} */}
                              <AccordionTrigger>
                                <span className="font-medium text-sm flex-1 text-left">
                                  {boardStateDetails[child.state] ? formatDate(boardStateDetails[child.state].timestamp, true) : 'Loading...'}
                                </span>
                              </AccordionTrigger>
                              <AccordionContent>
                                {(() => {
                                  const boardState = boardStateDetails[child.state];
                                  if (!boardState) return <p>No board state found for this session.</p>;
                                  return (
                                    <BoardStateCard boardState={boardState} />
                                  );
                                })()}
                                {/* {boardStateDetails[child.id] ? (
                                  <BoardStateCard boardState={boardStateDetails[child.id]} />
                                ) : (
                                  <p>Loading details...</p>
                                )} */}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
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
