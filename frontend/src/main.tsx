import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import App from './App';
import theme from './theme';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(17, 17, 40, 0.95)',
              color: '#f1f5f9',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              fontFamily: '"Inter", sans-serif',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#0a0a1a' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0a0a1a' },
            },
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
