/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Module1Upload } from './pages/Module1Upload';
import { Module2Mistakes } from './pages/Module2Mistakes';
import { Module3Preprocessing } from './pages/Module3Preprocessing';
import { Module4Training } from './pages/Module4Training';
import { Module5ErrorAnalysis } from './pages/Module5ErrorAnalysis';
import { Module6Retraining } from './pages/Module6Retraining';
import { Module7Comparison } from './pages/Module7Comparison';
import { Module8Prediction } from './pages/Module8Prediction';
import { Module9Explainability } from './pages/Module9Explainability';
import { Module10Database } from './pages/Module10Database';
import { Module11History } from './pages/Module11History';
import { Module12PDFReport } from './pages/Module12PDFReport';
import { Module13Dashboard } from './pages/Module13Dashboard';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeModule, notification, clearNotification } = useApp();

  const renderModule = () => {
    switch (activeModule) {
      case 1:
        return <Module1Upload />;
      case 2:
        return <Module2Mistakes />;
      case 3:
        return <Module3Preprocessing />;
      case 4:
        return <Module4Training />;
      case 5:
        return <Module5ErrorAnalysis />;
      case 6:
        return <Module6Retraining />;
      case 7:
        return <Module7Comparison />;
      case 8:
        return <Module8Prediction />;
      case 9:
        return <Module9Explainability />;
      case 10:
        return <Module10Database />;
      case 11:
        return <Module11History />;
      case 12:
        return <Module12PDFReport />;
      case 13:
        return <Module13Dashboard />;
      default:
        return <Module1Upload />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* 13-Module Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navigation & Status Header */}
        <TopBar />

        {/* Global Toast Notification */}
        {notification && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : notification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : notification.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={clearNotification}
              className="p-1 hover:bg-black/5 rounded text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto pb-12">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
