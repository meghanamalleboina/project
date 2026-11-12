import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import {
  LayoutDashboard, Database, Cpu, TrendingUp, FileText,
  BarChart3, RefreshCw, Trophy, Activity, ArrowRight,
  ShieldCheck, CheckCircle2, History
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

export const Module13Dashboard: React.FC = () => {
  const { setActiveModule, showNotification } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Module 13: Executive Command Center
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Platform Analytics Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated system metrics, activity timelines, model distributions, and dataset health scores queried in real-time from the database.
          </p>
        </div>

        <button
          onClick={fetchDashboardStats}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Aggregating Platform KPIs...</h3>
        </div>
      ) : stats ? (
        <>
          {/* 5 Core Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Datasets</span>
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{stats.total_datasets}</div>
              <span className="text-[10px] text-slate-400">Raw &amp; Transformed</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Analyses</span>
                <Activity className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-600 mt-2">{stats.total_experiments}</div>
              <span className="text-[10px] text-slate-400">Completed Runs</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Trained Models</span>
                <Cpu className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700 mt-2">{stats.total_models}</div>
              <span className="text-[10px] text-slate-400">Pipelines Stored</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Predictions</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-2">{stats.total_predictions}</div>
              <span className="text-[10px] text-slate-400">Inference Records</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500">Reports</span>
                <FileText className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 mt-2">{stats.total_reports}</div>
              <span className="text-[10px] text-slate-400">PDFs Generated</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Performance Overview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Model Benchmark Performance (%)</span>
              </h3>
              {stats.model_performance_overview.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.model_performance_overview} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, borderColor: '#cbd5e1', fontSize: 12 }} />
                      <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  No model performance records yet.
                </div>
              )}
            </div>

            {/* Dataset Quality Overview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Dataset Quality Health Distribution</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.quality_overview} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, borderColor: '#cbd5e1', fontSize: 12 }} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Activity Tables Row: Recent Experiments & Recent Datasets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Experiments */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Recent Machine Learning Experiments
                </h3>
                <button
                  onClick={() => setActiveModule(11)}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2 px-3">ID</th>
                      <th className="py-2 px-3">Target</th>
                      <th className="py-2 px-3">Best Model</th>
                      <th className="py-2 px-3">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recent_experiments.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-blue-900">{exp.id.slice(0, 10)}</td>
                        <td className="py-2 px-3 text-slate-700">{exp.target_column}</td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-900">{exp.best_model}</td>
                        <td className="py-2 px-3 font-sans">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 uppercase">
                            {exp.problem_type}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {stats.recent_experiments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 font-sans">
                          No experiments logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Datasets */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Recent Datasets Ingested
                </h3>
                <button
                  onClick={() => setActiveModule(1)}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1"
                >
                  <span>Upload More</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Rows</th>
                      <th className="py-2 px-3">Cols</th>
                      <th className="py-2 px-3">Quality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recent_datasets.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-sans font-medium text-slate-900 truncate max-w-[140px]" title={d.original_name}>
                          {d.original_name}
                        </td>
                        <td className="py-2 px-3">{d.row_count}</td>
                        <td className="py-2 px-3">{d.col_count}</td>
                        <td className="py-2 px-3">
                          {d.quality_score !== null ? (
                            <span className="font-bold text-emerald-600">{d.quality_score}/100</span>
                          ) : (
                            <span className="text-slate-400">Unaudited</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {stats.recent_datasets.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 font-sans">
                          No datasets uploaded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
