export type EraserStatus = 'good' | 'warning' | 'error';

export interface Eraser {
  id: string;
  name: string;
  room: string;
  dateInstalled: string;
  erasureCount: number;
  status: EraserStatus;
  lastActive?: string;
}

export interface BoardState {
  id: string;
  eraserId: string;
  imageUrl: string;
  timestamp: string;
  description?: string;
  tableContent?: string;
  labels?: string[];
  isComplete: boolean;
}
