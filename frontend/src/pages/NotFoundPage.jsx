import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-mono">
      <ShieldAlert className="w-16 h-16 text-blue-500 mb-4 opacity-80" />
      <h1 className="text-3xl font-bold font-display text-white mb-2">404 // CLASSIFIED ROUTE NOT FOUND</h1>
      <p className="text-slate-400 text-xs max-w-md mb-6">
        The requested telemetry endpoint or intelligence sector does not exist or has been restricted under cyber defense protocol.
      </p>
      <Link to="/" className="btn-primary text-xs py-2 px-4 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Command Center</span>
      </Link>
    </div>
  );
};
