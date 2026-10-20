import { create } from 'zustand';
import { FocusSession } from '@/types';
import { focusRepository } from '@/repositories/focusRepository';
import { hapticService } from '@/services/hapticService';

type FocusSessionType = 'work' | 'short_break' | 'long_break';

interface FocusState {
  sessionType: FocusSessionType;
  duration: number; // in seconds
  timeLeft: number; // in seconds
  isRunning: boolean;
  linkedTaskId: string | null;
  linkedTaskTitle: string | null;
  completedSessionsCount: number;
  history: FocusSession[];

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setSessionType: (type: FocusSessionType) => void;
  linkTask: (taskId: string | null, taskTitle: string | null) => void;
  loadHistory: () => Promise<void>;
  completeSession: () => Promise<void>;
}

const DURATIONS: Record<FocusSessionType, number> = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export const useFocusStore = create<FocusState>((set, get) => ({
  sessionType: 'work',
  duration: DURATIONS.work,
  timeLeft: DURATIONS.work,
  isRunning: false,
  linkedTaskId: null,
  linkedTaskTitle: null,
  completedSessionsCount: 0,
  history: [],

  start: () => {
    hapticService.light();
    set({ isRunning: true });
  },

  pause: () => {
    hapticService.light();
    set({ isRunning: false });
  },

  reset: () => {
    hapticService.light();
    const { sessionType } = get();
    set({ isRunning: false, timeLeft: DURATIONS[sessionType] });
  },

  tick: () => {
    const { timeLeft, isRunning } = get();
    if (!isRunning) return;

    if (timeLeft > 1) {
      set({ timeLeft: timeLeft - 1 });
    } else {
      // Completed!
      set({ timeLeft: 0, isRunning: false });
      get().completeSession();
    }
  },

  setSessionType: (type) => {
    hapticService.selection();
    set({
      sessionType: type,
      duration: DURATIONS[type],
      timeLeft: DURATIONS[type],
      isRunning: false,
    });
  },

  linkTask: (taskId, taskTitle) => {
    hapticService.selection();
    set({ linkedTaskId: taskId, linkedTaskTitle: taskTitle });
  },

  loadHistory: async () => {
    try {
      const history = await focusRepository.getSessions(20);
      set({ history });
    } catch {
      // Ignored
    }
  },

  completeSession: async () => {
    hapticService.success();
    const { sessionType, duration, linkedTaskId } = get();

    try {
      const minutes = Math.floor(duration / 60);
      await focusRepository.recordSession({
        task_id: linkedTaskId,
        duration_minutes: minutes,
        completed_at: new Date().toISOString(),
        session_type: sessionType,
      });

      set((state) => ({
        completedSessionsCount: state.completedSessionsCount + 1,
      }));

      await get().loadHistory();
    } catch {
      // Ignored
    }
  },
}));
