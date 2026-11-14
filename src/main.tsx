import { createRoot } from 'react-dom/client';
import { MuiThemeProvider } from './theme/MuiThemeProvider';
import { DemoStateProvider } from './context/DemoStateContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <MuiThemeProvider>
    <DemoStateProvider>
      <App />
    </DemoStateProvider>
  </MuiThemeProvider>
);
