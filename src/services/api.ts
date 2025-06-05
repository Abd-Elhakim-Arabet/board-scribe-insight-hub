import { createClient } from '@supabase/supabase-js';
import { Eraser, BoardState, Session } from '@/types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Eraser APIs
export const getErasers = async (): Promise<Eraser[]> => {
  const { data, error } = await supabase
    .from('Eraser')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

export const getEraserById = async (id: string): Promise<Eraser | null> => {
  const { data, error } = await supabase
    .from('Eraser')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

// Board state APIs
export const getBoardStatesByEraserId = async (eraserId: string): Promise<BoardState[]> => {
  const { data, error } = await supabase
    .from('Board_State')
    .select('*')
    .eq('eraser', eraserId)
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getBoardStateById = async (id: string): Promise<BoardState | null> => {
  const { data, error } = await supabase
    .from('Board_State')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateBoardStateDescription = async (id: string, description: string): Promise<void> => {
  const { error } = await supabase
    .from('Board_State')
    .update({ description })
    .eq('id', id);
  
  if (error) throw error;
};

export const updateBoardStateTableContent = async (id: string, tableContent: string): Promise<void> => {
  const { error } = await supabase
    .from('Board_State')
    .update({ tableContent })
    .eq('id', id);
  
  if (error) throw error;
};

// New function to update board state labels
export const updateBoardStateLabels = async (id: string, labels: string[]): Promise<void> => {
  const { error } = await supabase
    .from('Board_State')
    .update({ labels })
    .eq('id', id);
  
  if (error) throw error;
};

// Function to call Python API for image summarization
export const getImageSummary = async (imageUrl: string): Promise<string> => {
  try {
    
    const response = await fetch('https://ai-summary-chi.vercel.app/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to summarize image');
    }
    
    const data = await response.json();
    return data.summary;
    
  } catch (error) {
    console.error('Error summarizing image:', error);
    return 'Unable to generate summary';
  }
};

// Function to call Python API for table extraction
export const extractTableContent = async (imageUrl: string): Promise<string> => {
  try {
    
    const response = await fetch('https://ai-summary-chi.vercel.app/api/extract-table', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to extract table content');
    }
    
    const data = await response.json();
    return data.tableContent;
    
  } catch (error) {
    console.error('Error extracting table content:', error);
    return 'Unable to extract table content';
  }
};

export const availableLabels = [
  "Computer and Network Security",
  "Machine Learning",
  "Group Project",
  "Numerical Methods and Optimisation",
  "Advanced Databases",
  "Time Series Analysis and Classification",
  "Project Management"
];

export const classifyContent = async (content: string): Promise<string[]> => {
  try {
    const response = await fetch('https://ai-summary-chi.vercel.app/api/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        content,
        availableLabels 
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to classify content');
    }
    
    const data = await response.json();
    return data.labels || [];
  } catch (error) {
    console.error('Error classifying content:', error);
    return [];
  }
};

// Get last 500 logs for an eraser
export interface EraserLog {
  id: number;
  eraserId: number;
  timestamp: string;
  message: string;
}

export const getEraserLogs = async (eraserId: string): Promise<EraserLog[]> => {
  const { data, error } = await supabase
    .from('EraserLogs')
    .select('*')
    .eq('eraserId', eraserId)
    .order('timestamp', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data || [];
};

// Session APIs
export const getSessions = async (): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('Session')
    .select('*')
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getBoardStatesBySessionId = async (sessionId: number): Promise<BoardState[]> => {
  const { data, error } = await supabase
    .from('Board_State')
    .select('*')
    .eq('session', sessionId)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getSessionChildren = async (sessionId: number): Promise<any[]> => {
  const { data, error } = await supabase
    .from('session_state')
    .select('*')
    .eq('session', sessionId);

  if (error) throw error;
  return data || [];
};

// Scheduling APIs
export interface ScheduleTask {
  id?: number;
  eraserId: string;
  tasktype: 'capture' | 'erase' | 'capture_erase';
  scheduletype: 'time' | 'interval' | 'weekly';
  schedulevalue: string;
  intervalunit?: 'minutes' | 'hours' | 'days';
  isactive: boolean;
  description?: string;
  createdat?: string;
  lastRun?: string;
  nextrun?: string;
}

export const getSchedulesByEraserId = async (eraserId: string): Promise<ScheduleTask[]> => {
  const { data, error } = await supabase
    .from('eraser_schedules')
    .select('*')
    .eq('eraserId', eraserId)
    .order('createdat', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createScheduleTask = async (schedule: Omit<ScheduleTask, 'id'>): Promise<ScheduleTask> => {
  const { data, error } = await supabase
    .from('eraser_schedules')
    .insert([schedule])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateScheduleTask = async (id: number, updates: Partial<ScheduleTask>): Promise<void> => {
  const { error } = await supabase
    .from('eraser_schedules')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

export const deleteScheduleTask = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('eraser_schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getAllActiveSchedules = async (): Promise<ScheduleTask[]> => {
  const { data, error } = await supabase
    .from('eraser_schedules')
    .select('*')
    .eq('isactive', true)
    .order('nextrun', { ascending: true });

  if (error) throw error;
  return data || [];
};
