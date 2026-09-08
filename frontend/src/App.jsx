import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AlertProvider } from './contexts/AlertContext';
import { TopBar } from './components/layout/TopBar';
import { DashboardPage } from './pages/DashboardPage';
import { CommandPage } from './pages/CommandPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  return (
    <AlertProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <>
                <TopBar />
                <main className="flex-1">
                  <DashboardPage />
                </main>
              </>
            }
          />
          <Route
            path="/command"
            element={
              <>
                <TopBar />
                <main className="flex-1">
                  <CommandPage />
                </main>
              </>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AlertProvider>
  );
};

export default App;
