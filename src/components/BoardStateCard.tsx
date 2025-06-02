import React, { useEffect, useState } from 'react';
import { BoardState } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getImageSummary, updateBoardStateDescription, extractTableContent, updateBoardStateTableContent } from '@/services/api';
import { RefreshCw, CheckCircle, ClockIcon, ClipboardCopy, AlertTriangle, Tag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LabelManager from './labels/LabelManager';

interface BoardStateCardProps {
  boardState: BoardState;
}

const BoardStateCard: React.FC<BoardStateCardProps> = ({ boardState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [summary, setSummary] = useState(boardState.description || '');
  const [tableContent, setTableContent] = useState(boardState.tableContent || '');
  const [labels, setLabels] = useState<string[]>(boardState.labels || []);
  const { toast } = useToast();

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

  const handleExtractTable = async () => {
    if (isLoadingTable) return;

    setIsLoadingTable(true);
    try {
      const extractedTable = await extractTableContent(boardState.imageUrl);
      setTableContent(extractedTable);
      await updateBoardStateTableContent(boardState.id, extractedTable);
    } catch (error) {
      console.error('Failed to extract table content:', error);
    } finally {
      setIsLoadingTable(false);
    }
  };

  const handleCopyText = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to your clipboard",
        duration: 2000,
      });
    }
  };

  const handleLabelsUpdated = (updatedLabels: string[]) => {
    setLabels(updatedLabels);
  };

  useEffect(() => {
    if (!boardState.description && boardState.imageUrl) {
      handleGenerateSummary();
    }
  }, [boardState.id]);

  // Load table content when viewing the Tables tab
  useEffect(() => {
    if (!tableContent && boardState.imageUrl) {
      handleExtractTable();
    }
  }, [boardState.imageUrl]);

  const convertToPreviewUrl = (exportViewUrl: string): string => {
    // Extract the ID from the export=view URL
    const idMatch = exportViewUrl.match(/id=([^&]+)/);
    
    if (!idMatch || !idMatch[1]) {
      throw new Error('Could not extract Drive ID from URL');
    }
    
    const fileId = idMatch[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  const image_prwview_url = convertToPreviewUrl(boardState.imageUrl);

  return (
    <Card className="overflow-hidden">
      <div>
        {/* Image on top, details below (vertical layout) */}
        <div className="w-full flex-shrink-0 flex items-start justify-center p-2 md:p-4">
          <div className="relative w-full max-w-md bg-gray-100 rounded overflow-hidden mx-auto flex items-center justify-center" style={{ aspectRatio: '4/3', height: 'auto', minHeight: '4rem' }}>
            <iframe
              src={image_prwview_url}
              className="rounded w-full h-full object-contain"
              allow="autoplay"
              title="Board State Image"
              style={{ minHeight: '4rem', background: 'transparent' }}
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
        </div>
        <div className="flex-1 min-w-0">
          <CardContent className="pt-0 pb-2">
            <div className="text-sm text-gray-500 mb-2 flex items-center">
              <ClockIcon className="h-3.5 w-3.5 mr-1" />
              {formatDate(boardState.timestamp)}
            </div>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="table">Table Content</TabsTrigger>
                <TabsTrigger value="labels" className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Labels
                </TabsTrigger>
              </TabsList>
              <TabsContent value="summary">
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">Summary</h4>
                    {summary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopyText(summary)}
                        title="Copy summary text"
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {summary ? (
                    <p className="text-sm text-gray-600">{summary}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      {isLoading ? 'Generating summary...' : 'No summary available.'}
                    </p>
                  )}
                  <div className="flex justify-end mt-3">
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
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="table">
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">Table Content</h4>
                    {tableContent && tableContent !== 'No table detected in the image.' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopyText(tableContent)}
                        title="Copy table content"
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {tableContent ? (
                    <>
                      <pre className="text-sm font-mono text-gray-600 whitespace-pre-wrap overflow-x-auto">{tableContent}</pre>
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                        <p>Table extraction may not be fully accurate due to board visibility limitations</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      {isLoadingTable ? 'Extracting table content...' : 'No table content available.'}
                    </p>
                  )}
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExtractTable}
                      disabled={isLoadingTable}
                    >
                      {isLoadingTable ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Regenerate Table Content'
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="labels">
                <LabelManager
                  boardStateId={boardState.id}
                  content={summary || tableContent || ''}
                  initialLabels={labels}
                  onLabelsUpdated={handleLabelsUpdated}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end pt-0" />
        </div>
      </div>
    </Card>
  );
};

export default BoardStateCard;
