/**
 * Grounds & Gates - Root Application Entry Point
 * Architecture:
 * - React Router for URL-based navigation & nested layouts
 * - Redux Toolkit for shared client-side application state
 * - TanStack React Query for server API state & centralized caching
 * - Material UI with official Forest Green & Gate Gold architectural styling
 */

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { queryClient } from './query/queryClient';
import { AppStateProvider } from './context/AppStateContext';
import { AppRouter } from './routes/AppRouter';

export function App() {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppStateProvider>
          <AppRouter />
        </AppStateProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

export default App;
