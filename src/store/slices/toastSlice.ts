import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
}

const initialState: ToastState = {
  toasts: [],
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<ToastItem, 'id'> & { id?: string }>) => {
      const id = action.payload.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      // Prevent duplicate messages of the same type within recent queue
      const isDuplicate = state.toasts.some(
        (t) => t.message === action.payload.message && t.type === action.payload.type
      );
      if (!isDuplicate) {
        state.toasts.push({
          id,
          type: action.payload.type,
          title: action.payload.title,
          message: action.payload.message,
          duration: action.payload.duration ?? 5000,
        });
      }
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearToasts } = toastSlice.actions;
export default toastSlice.reducer;

