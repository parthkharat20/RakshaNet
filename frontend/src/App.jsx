import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AlertProvider, useAlertContext } from './contexts/AlertContext';
import { TopBar } from './components/layout/TopBar';
import { DashboardPage } from './pages/DashboardPage';
import { CommandPage } from './pages/CommandPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent = () => {
  const { theme } = useAlertContext();
  const isDark = theme === 'dark';

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <>
              <TopBar />
              <main className="flex-1 overflow-hidden flex flex-col min-h-0">
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
              <main className="flex-1 overflow-hidden flex flex-col min-h-0">
                <CommandPage />
              </main>
            </>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export const App = () => {
  return (
    <AlertProvider>
      <AppContent />
    </AlertProvider>
  );
};

export default App;
