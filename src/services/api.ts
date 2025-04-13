
import { createClient } from '@supabase/supabase-js';
import { Eraser, BoardState } from '@/types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Eraser APIs
export const getErasers = async (): Promise<Eraser[]> => {
  const { data, error } = await supabase
    .from('erasers')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

export const getEraserById = async (id: string): Promise<Eraser | null> => {
  const { data, error } = await supabase
    .from('erasers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

// Board state APIs
export const getBoardStatesByEraserId = async (eraserId: string): Promise<BoardState[]> => {
  const { data, error } = await supabase
    .from('board_states')
    .select('*')
    .eq('eraserId', eraserId)
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getBoardStateById = async (id: string): Promise<BoardState | null> => {
  const { data, error } = await supabase
    .from('board_states')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateBoardStateDescription = async (id: string, description: string): Promise<void> => {
  const { error } = await supabase
    .from('board_states')
    .update({ description })
    .eq('id', id);
  
  if (error) throw error;
};

// Function to call Python API for image summarization
export const getImageSummary = async (imageUrl: string): Promise<string> => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch(`/api/summarize`, {
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
