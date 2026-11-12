import React from 'react';
import { useApp } from '../context/AppContext';
import { MODULES } from './Sidebar';
import { ChevronLeft, ChevronRight, Sparkles, Database, FileText } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    loadSample,
    isLoadingSample,
    dbHealthy,
    activeDataset,
    activeExperiment
  } = useApp();

  const currentMod = MODULES.find((m) => m.id === activeModule) || MODULES[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shrink-0">
      {/* Title & Stage */}
      <div className="flex items-center space-x-3 min-w-0">
        <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-sm">
          {currentMod.id}
        </span>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2 truncate">
            <span>{currentMod.title}</span>
            {activeDataset && (
              <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {activeDataset.original_name}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 truncate">{currentMod.shortDesc}</p>
        </div>
      </div>

      {/* Action shortcuts & Sample Loaders */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Quick Sample Selector */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 px-1.5 flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
            Samples:
          </span>
          <button
            onClick={() => loadSample('churn')}
            disabled={isLoadingSample}
            className="px-2 py-1 rounded bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium shadow-xs transition-colors disabled:opacity-50"
            title="Customer Churn Classification Dataset"
          >
            Churn (Classif.)
          </button>
          <button
            onClick={() => loadSample('housing')}
            disabled={isLoadingSample}
            className="px-2 py-1 rounded bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium shadow-xs transition-colors disabled:opacity-50"
            title="Housing Prices Regression Dataset"
          >
            Housing (Regr.)
          </button>
          <button
            onClick={() => loadSample('quality_stress')}
            disabled={isLoadingSample}
            className="px-2 py-1 rounded bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 text-xs font-medium shadow-xs transition-colors disabled:opacity-50"
            title="Dataset with missing values, duplicates, outliers and constant features"
          >
            Quality Stress
          </button>
        </div>

        {/* Database indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-mono">SQLite / PG</span>
          <span className={`w-1.5 h-1.5 rounded-full ${dbHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        </div>

        {/* Prev / Next Steppers */}
        <div className="flex items-center space-x-1 border-l border-slate-200 pl-3">
          <button
            onClick={() => setActiveModule(Math.max(1, activeModule - 1))}
            disabled={activeModule === 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
            title="Previous Module"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveModule(Math.min(13, activeModule + 1))}
            disabled={activeModule === 13}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-40"
            title="Next Module"
          >
            <span className="hidden sm:inline">Next Module</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
