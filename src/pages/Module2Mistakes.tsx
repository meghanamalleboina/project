import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { MistakesDetectionReport } from '../types';
import {
  AlertTriangle, CheckCircle2, AlertOctagon, HelpCircle, ArrowRight,
  ShieldAlert, RefreshCw, BarChart2, Check, Info
} from 'lucide-react';

export const Module2Mistakes: React.FC = () => {
  const { activeDataset, setActiveModule, showNotification } = useApp();
  const [report, setReport] = useState<MistakesDetectionReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchMistakes = async () => {
    if (!activeDataset) return;
    setIsLoading(true);
    try {
      const data = await api.detectMistakes(activeDataset.id);
      setReport(data);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to detect dataset mistakes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeDataset) {
      fetchMistakes();
    }
  }, [activeDataset?.id]);

  if (!activeDataset) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Dataset Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please upload or load a dataset in Module 1 before running automated mistakes detection.
        </p>
        <button
          onClick={() => setActiveModule(1)}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
        >
          Go to Module 1: Upload Dataset
        </button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 border-emerald-500 bg-emerald-50';
    if (score >= 70) return 'text-amber-600 border-amber-500 bg-amber-50';
    return 'text-rose-600 border-rose-500 bg-rose-50';
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
            Module 2: Data Quality Audit
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Dataset Mistakes Detection</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mathematical auditing of missing values, duplicate records, IQR outliers, zero-variance columns, and schema discrepancies.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMistakes}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-Audit</span>
          </button>
          <button
            onClick={() => setActiveModule(3)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <span>Proceed to Preprocessing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Auditing Dataset Hygiene...</h3>
          <p className="text-xs text-slate-500 mt-1">Calculating mathematical IQR fences and null distributions.</p>
        </div>
      ) : report ? (
        <>
          {/* Key Metrics / Quality Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Score Ring / Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Computed Quality Score</span>
              <div className="flex items-baseline space-x-2 my-2">
                <span className={`text-4xl font-black ${report.quality_score >= 80 ? 'text-emerald-600' : report.quality_score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {report.quality_score}
                </span>
                <span className="text-sm text-slate-400 font-semibold">/ 100</span>
              </div>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${getScoreColor(report.quality_score)}`}>
                {report.quality_score >= 85 ? 'High Integrity' : report.quality_score >= 70 ? 'Moderate Quality' : 'Needs Preprocessing'}
              </span>
            </div>

            {/* Missing Cells */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Missing Value Cells</span>
              <div className="my-2">
                <span className={`text-3xl font-black ${report.missing_report.total_missing_cells > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {report.missing_report.total_missing_cells}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">
                  ({report.missing_report.missing_cell_percentage}% of total cells)
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {Object.keys(report.missing_report.columns_with_missing).length} columns affected
              </div>
            </div>

            {/* Duplicates */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Duplicate Records</span>
              <div className="my-2">
                <span className={`text-3xl font-black ${report.duplicate_report.count > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {report.duplicate_report.count}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">
                  ({report.duplicate_report.percentage}% rows)
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {report.duplicate_report.has_duplicates ? 'Causes training data leakage' : 'Zero duplicates detected'}
              </div>
            </div>

            {/* Outliers */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">IQR Outliers</span>
              <div className="my-2">
                <span className={`text-3xl font-black ${report.outliers_report.total_outliers_detected > 0 ? 'text-indigo-600' : 'text-slate-800'}`}>
                  {report.outliers_report.total_outliers_detected}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">values detected</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Across {Object.keys(report.outliers_report.columns_with_outliers).length} numerical columns
              </div>
            </div>
          </div>

          {/* Actionable Engineering Recommendations */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-blue-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Actionable Preprocessing Recommendations</span>
            </h3>
            <ul className="mt-3 space-y-2">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start space-x-2 text-xs text-blue-950 font-medium">
                  <span className="w-4 h-4 rounded-full bg-blue-200/80 text-blue-800 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Detailed Diagnosis Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column-wise Quality Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>Column Quality Diagnostics</span>
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-64">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Column</th>
                      <th className="py-2 px-3">Score</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Missing</th>
                      <th className="py-2 px-3">Outliers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {report.column_analysis.map((col) => (
                      <tr key={col.column} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-800">{col.column}</td>
                        <td className="py-2 px-3 font-bold">{col.quality_score}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              col.status === 'healthy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : col.status === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {col.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{col.missing_count}</td>
                        <td className="py-2 px-3 text-slate-600">{col.outliers_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Outliers & Constant Columns Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span>Constant Columns (Zero Predictive Signal)</span>
                </h3>
                {report.constant_cols.length > 0 ? (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <span className="font-bold">Detected constant features: </span>
                    {report.constant_cols.join(', ')}
                    <div className="text-[11px] text-rose-600 mt-1">These features contain only 1 unique value across all rows and will be filtered.</div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-emerald-700 flex items-center space-x-1.5 font-medium">
                    <Check className="w-4 h-4" />
                    <span>No constant (zero-variance) columns found.</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>IQR Outlier Bounds Detail</span>
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(report.outliers_report.columns_with_outliers).map(([col, data]) => (
                    <div key={col} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span className="font-mono">{col}</span>
                        <span className="text-rose-600">{data.count} outliers ({data.percentage}%)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Fences: [{data.lower_bound} to {data.upper_bound}] | Min: {data.min}, Max: {data.max}
                      </div>
                    </div>
                  ))}
                  {Object.keys(report.outliers_report.columns_with_outliers).length === 0 && (
                    <div className="p-3 text-xs text-slate-500 italic">No severe numerical outliers detected.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
