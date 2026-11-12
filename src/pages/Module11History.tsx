import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ExperimentHistoryItem } from '../types';
import {
  History, ArrowRight, RefreshCw, Trash2, FolderOpen,
  FileText, CheckCircle2, AlertCircle, Eye
} from 'lucide-react';

export const Module11History: React.FC = () => {
  const {
    historyList,
    refreshHistory,
    setActiveExperiment,
    setActiveModule,
    showNotification
  } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleReopen = async (item: ExperimentHistoryItem) => {
    setIsLoading(true);
    try {
      const details = await api.getExperimentDetails(item.id);
      setActiveExperiment({
        experiment_id: details.id,
        dataset_id: details.dataset_id,
        target_column: details.target_column,
        problem_type: details.problem_type,
        best_model_name: details.best_model_name,
        models: details.models,
        training_logs: ['Reopened from persistent storage'],
      });
      showNotification('success', `Reopened Experiment ${item.id}`);
      setActiveModule(4); // Switch to Model Training/Leaderboard
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to reopen experiment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete Experiment ${id}?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteExperiment(id);
      await refreshHistory();
      showNotification('success', `Experiment ${id} deleted.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete experiment');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Module 11: Audit Trail &amp; Registry
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Analysis History &amp; Experiment Tracking</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Query past experiments, re-load historical model states, inspect archived metrics, and download audit documents.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={refreshHistory}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setActiveModule(12)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <span>Proceed to PDF Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <History className="w-4 h-4 text-blue-600" />
            <span>Completed Machine Learning Runs ({historyList.length})</span>
          </h3>
        </div>

        {historyList.length > 0 ? (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Experiment ID</th>
                  <th className="py-2.5 px-3">Dataset</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Problem Type</th>
                  <th className="py-2.5 px-3">Best Model</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {historyList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-blue-900">{item.id}</td>
                    <td className="py-3 px-3 font-sans font-medium text-slate-800">{item.dataset_name}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{item.target_column}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-700">
                        {item.problem_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-800">{item.best_model}</td>
                    <td className="py-3 px-3 text-slate-500 font-sans text-[11px]">{item.created_at}</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleReopen(item)}
                          disabled={isLoading}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                          title="Reopen Experiment"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Reopen</span>
                        </button>
                        {item.has_report && item.report_filename && (
                          <a
                            href={`/api/reports/download/${item.report_filename}`}
                            download
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Download Saved PDF"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Experiment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No completed experiments found. Run Module 4 to train models and generate history records.
          </div>
        )}
      </div>
    </div>
  );
};
