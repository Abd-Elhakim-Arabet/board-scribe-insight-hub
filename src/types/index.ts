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

export type BoardState = {
  id: string;
  timestamp: string;
  imageUrl: string | null;
  isComplete: boolean | null;
  eraser: number | null;
  description: string | null;
  tableContent: string | null;
  labels: string[] | null;
  session: number | null; // Added session property
};

export type Session = {
  id: number;
  eraser: number | null;
  started_at: string;
  ended_at: string | null;
  summary: string | null;
};

export interface ScheduleTask {
  id?: number;
  eraserid: string;
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
