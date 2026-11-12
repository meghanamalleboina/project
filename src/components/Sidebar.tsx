import React from 'react';
import {
  Upload, AlertTriangle, Filter, Cpu, Bug, Wrench, GitCompare,
  TrendingUp, Sparkles, Database, History, FileText, LayoutDashboard,
  CheckCircle2, Circle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface ModuleItem {
  id: number;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const MODULES: ModuleItem[] = [
  { id: 1, title: 'CSV Dataset Upload', shortDesc: 'Upload, inspect & validate raw CSV data', icon: Upload },
  { id: 2, title: 'Dataset Mistakes Detection', shortDesc: 'Audit missing values, outliers & quality', icon: AlertTriangle },
  { id: 3, title: 'Data Preprocessing', shortDesc: 'Imputation, deduplication, encoding & scaling', icon: Filter },
  { id: 4, title: 'Automatic ML Model Training', shortDesc: 'Train multi-algorithm classification & regression', icon: Cpu },
  { id: 5, title: 'Model Error Analysis', shortDesc: 'Confusion matrix, residuals & diagnostic errors', icon: Bug },
  { id: 6, title: 'Model Improvement & Retraining', shortDesc: 'Hyperparameter tuning & class balancing', icon: Wrench },
  { id: 7, title: 'Before vs After Performance Comparison', shortDesc: 'Audit baseline vs improved metrics', icon: GitCompare },
  { id: 8, title: 'Prediction', shortDesc: 'Real-time single inference & batch CSV scoring', icon: TrendingUp },
  { id: 9, title: 'Explainable AI', shortDesc: 'Feature importance, permutation & waterfall attribution', icon: Sparkles },
  { id: 10, title: 'Database Storage', shortDesc: 'Relational PostgreSQL / SQLite table inspection', icon: Database },
  { id: 11, title: 'Analysis History', shortDesc: 'Track experiments, past models & audit logs', icon: History },
  { id: 12, title: 'PDF Report Generation', shortDesc: 'Export 14-section ReportLab engineering audit', icon: FileText },
  { id: 13, title: 'Dashboard', shortDesc: 'Executive KPIs, activity timeline & model distribution', icon: LayoutDashboard },
];

export const Sidebar: React.FC = () => {
  const { activeModule, setActiveModule, activeDataset, activeExperiment } = useApp();

  const isModuleReady = (id: number): boolean => {
    if (id === 1) return true;
    if (id <= 3) return !!activeDataset;
    if (id <= 9 || id === 12) return !!activeExperiment;
    return true; // DB, History, Dashboard always accessible
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 select-none shadow-sm z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center font-bold text-lg text-white shadow-inner">
            N
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight">NexaDS</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500 text-white uppercase tracking-wider">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-blue-200/80 leading-tight">Automated Data Science &amp; ML</p>
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700">13 Pipeline Modules</span>
        <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold border border-blue-100">
          Module {activeModule} of 13
        </span>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          const isReady = isModuleReady(mod.id);

          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-start space-x-2.5 group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-700 hover:bg-slate-100/80 hover:text-blue-700'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    <span className="text-[11px] opacity-70 mr-1.5 font-mono">{mod.id}.</span>
                    {mod.title}
                  </span>
                  {isReady ? (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-blue-200' : 'text-emerald-500'
                      }`}
                    />
                  ) : (
                    <Circle className={`w-3 h-3 shrink-0 ${isActive ? 'text-blue-300' : 'text-slate-300'}`} />
                  )}
                </div>
                <p
                  className={`text-[10px] truncate mt-0.5 ${
                    isActive ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-500'
                  }`}
                >
                  {mod.shortDesc}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Active Context Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active State</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
        </div>
        <div className="truncate font-medium text-slate-800 text-[11px]">
          {activeDataset ? (
            <span className="text-blue-600">📊 {activeDataset.original_name}</span>
          ) : (
            <span className="text-slate-400 italic">No dataset selected</span>
          )}
        </div>
        {activeExperiment && (
          <div className="truncate text-[10px] text-slate-500 mt-0.5 font-mono">
            Exp: {activeExperiment.experiment_id.slice(0, 12)} ({activeExperiment.problem_type})
          </div>
        )}
      </div>
    </aside>
  );
};
