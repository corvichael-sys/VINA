import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './app/globals.css'; // Changed import to src/app/globals.css
import { SessionContextProvider } from './context/SessionContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SessionContextProvider>
      <App />
    </SessionContextProvider>
  </React.StrictMode>,
);