import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ModelComparison } from '../types';
import {
  GitCompare, ArrowRight, RefreshCw, Trophy, TrendingUp,
  CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, CartesianGrid
} from 'recharts';

export const Module7Comparison: React.FC = () => {
  const { activeExperiment, setActiveModule, showNotification } = useApp();
  const [comparisonData, setComparisonData] = useState<ModelComparison | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchComparison = async () => {
    if (!activeExperiment) return;
    setIsLoading(true);
    try {
      const data = await api.getComparison(activeExperiment.experiment_id);
      setComparisonData(data);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to load model comparison');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeExperiment) {
      fetchComparison();
    }
  }, [activeExperiment?.experiment_id]);

  if (!activeExperiment) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <GitCompare className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Experiment Available</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please run model training in Module 4 to compare baseline and retrained algorithms.
        </p>
        <button
          onClick={() => setActiveModule(4)}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
        >
          Go to Module 4: Automatic ML Training
        </button>
      </div>
    );
  }

  // Format Recharts data
  const chartData = comparisonData?.comparison.map((item) => ({
    metric: item.metric.replace('_', ' ').toUpperCase(),
    Baseline: item.baseline,
    Improved: item.improved,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Module 7: Benchmark Audit
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Before vs After Performance Comparison</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side audit of initial baseline estimators versus hyperparameter-tuned pipelines across all evaluation metrics.
          </p>
        </div>

        <button
          onClick={() => setActiveModule(8)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
        >
          <span>Proceed to Prediction</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Compiling Metric Comparison...</h3>
        </div>
      ) : comparisonData ? (
        <>
          {/* Models Compared Header Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Baseline Architecture</span>
              <div className="text-base font-bold text-slate-800 mt-1 flex items-center space-x-2">
                <span>{comparisonData.baseline_model}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">Default Config</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-blue-600">Improved Architecture</span>
              <div className="text-base font-bold text-blue-950 mt-1 flex items-center space-x-2">
                <span>{comparisonData.improved_model}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800 font-semibold">Tuned &amp; Balanced</span>
              </div>
            </div>
          </div>

          {/* Comparison Metrics Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Computed Performance Metrics Comparison
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Metric</th>
                    <th className="py-2.5 px-3">Baseline</th>
                    <th className="py-2.5 px-3">Improved</th>
                    <th className="py-2.5 px-3">Absolute Delta</th>
                    <th className="py-2.5 px-3">Percentage Change</th>
                    <th className="py-2.5 px-3">Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {comparisonData.comparison.map((row) => {
                    const isBetter = row.is_improved;
                    return (
                      <tr key={row.metric} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-800 capitalize">
                          {row.metric.replace('_', ' ')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{row.baseline}</td>
                        <td className="py-2.5 px-3 font-bold text-blue-700">{row.improved}</td>
                        <td className={`py-2.5 px-3 font-bold ${row.diff > 0 ? 'text-emerald-600' : row.diff < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                          {row.diff > 0 ? `+${row.diff}` : row.diff}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                              isBetter ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isBetter ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            <span>{row.pct_change > 0 ? `+${row.pct_change}%` : `${row.pct_change}%`}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          {isBetter ? (
                            <span className="text-emerald-700 font-semibold">Superior Performance</span>
                          ) : (
                            <span className="text-slate-500">Comparable</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Visual Bar Comparison */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                Visual Metric Benchmarking (Baseline vs Improved)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, borderColor: '#cbd5e1', fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Improved" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
