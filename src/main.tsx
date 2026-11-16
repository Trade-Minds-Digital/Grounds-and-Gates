import { createRoot } from 'react-dom/client';
import { MuiThemeProvider } from './theme/MuiThemeProvider';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>
);
