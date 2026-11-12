import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { PreprocessingSummary } from '../types';
import {
  Filter, Play, CheckCircle2, ArrowRight, RefreshCw, Layers,
  Sliders, Database, ListChecks, ArrowLeftRight
} from 'lucide-react';

export const Module3Preprocessing: React.FC = () => {
  const { activeDataset, setActiveDataset, setActiveModule, showNotification } = useApp();

  const [handleMissing, setHandleMissing] = useState<boolean>(true);
  const [missingStrategy, setMissingStrategy] = useState<string>('mean');
  const [removeDuplicates, setRemoveDuplicates] = useState<boolean>(true);
  const [encoding, setEncoding] = useState<string>('one_hot');
  const [scaling, setScaling] = useState<string>('standard');
  const [outlierTreatment, setOutlierTreatment] = useState<string>('iqr_clip');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [summary, setSummary] = useState<PreprocessingSummary | null>(null);

  const handleRunPreprocessing = async () => {
    if (!activeDataset) return;
    setIsProcessing(true);
    try {
      const res = await api.runPreprocessing({
        dataset_id: activeDataset.id,
        handle_missing: handleMissing,
        missing_strategy: missingStrategy,
        remove_duplicates: removeDuplicates,
        encoding: encoding,
        scaling: scaling,
        outlier_treatment: outlierTreatment,
      });
      setSummary(res);
      showNotification('success', `Preprocessing finished! ${res.operations_applied.length} operations applied.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Preprocessing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!activeDataset) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Filter className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Dataset Loaded</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please upload or load a dataset first to configure transformations.
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

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Module 3: Feature Engineering
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Data Preprocessing &amp; Pipeline Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Scikit-learn imputers, One-Hot encoders, scalers, and outlier handling to prepare clean training data without data leakage.
          </p>
        </div>

        {summary && (
          <button
            onClick={() => setActiveModule(4)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <span>Proceed to Model Training</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Preprocessing Operations</span>
          </div>

          {/* Missing values */}
          <div>
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Missing Value Treatment</span>
              <input
                type="checkbox"
                checked={handleMissing}
                onChange={(e) => setHandleMissing(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <select
              value={missingStrategy}
              onChange={(e) => setMissingStrategy(e.target.value)}
              disabled={!handleMissing}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 font-medium text-slate-800 disabled:opacity-50"
            >
              <option value="mean">Mean Imputation (Numerical)</option>
              <option value="median">Median Imputation (Robust)</option>
              <option value="mode">Mode / Most Frequent (Categorical)</option>
              <option value="drop">Drop Rows with Missing Values</option>
            </select>
          </div>

          {/* Deduplication */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <div>
                <span>Duplicate Records Removal</span>
                <p className="text-[11px] text-slate-400 font-normal">Drop exact identical rows</p>
              </div>
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          {/* Categorical Encoding */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Categorical Encoding</label>
            <select
              value={encoding}
              onChange={(e) => setEncoding(e.target.value)}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 font-medium text-slate-800"
            >
              <option value="one_hot">One-Hot Encoding (pd.get_dummies / OneHotEncoder)</option>
              <option value="label">Label Encoding (Ordinal)</option>
              <option value="none">None (Keep Raw)</option>
            </select>
          </div>

          {/* Numerical Scaling */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Numerical Feature Scaling</label>
            <select
              value={scaling}
              onChange={(e) => setScaling(e.target.value)}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 font-medium text-slate-800"
            >
              <option value="standard">StandardScaler (Zero Mean, Unit Variance)</option>
              <option value="minmax">MinMaxScaler (Normalized [0, 1])</option>
              <option value="none">None (Raw Scales)</option>
            </select>
          </div>

          {/* Outlier Treatment */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Outlier Treatment (IQR Fences)</label>
            <select
              value={outlierTreatment}
              onChange={(e) => setOutlierTreatment(e.target.value)}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 font-medium text-slate-800"
            >
              <option value="iqr_clip">IQR Capping (Clip to Q1 - 1.5*IQR &amp; Q3 + 1.5*IQR)</option>
              <option value="iqr_remove">IQR Trimming (Remove Outlier Rows)</option>
              <option value="none">None (Preserve Outliers)</option>
            </select>
          </div>

          {/* Action Button */}
          <div className="pt-3">
            <button
              onClick={handleRunPreprocessing}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Transforming Dataset...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Preprocessing Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results & Before/After Comparison */}
        <div className="lg:col-span-2 space-y-4">
          {summary ? (
            <>
              {/* Before vs After Cards */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                  <span>Before vs After Transformation Summary</span>
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Rows (Original)</span>
                    <div className="text-xl font-black text-slate-800 mt-0.5">{summary.rows_before}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-blue-700">Rows (Processed)</span>
                    <div className="text-xl font-black text-blue-700 mt-0.5">{summary.rows_after}</div>
                    <span className="text-[10px] text-blue-600">
                      {summary.rows_before - summary.rows_after} rows pruned
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Columns (Raw)</span>
                    <div className="text-xl font-black text-slate-800 mt-0.5">{activeDataset.col_count}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Missing Imputed</span>
                    <div className="text-xl font-black text-emerald-700 mt-0.5">{summary.missing_handled}</div>
                    <span className="text-[10px] text-emerald-600">Cells resolved</span>
                  </div>
                </div>

                {/* Operations tags */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-600 block mb-1.5">Applied Operations:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.operations_applied.map((op, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        ✓ {op}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transformation Execution Logs */}
              <div className="bg-slate-900 rounded-2xl p-4 text-white font-mono text-xs shadow-md">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <ListChecks className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">Pipeline Execution Audit Log</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Success</span>
                </div>
                <div className="space-y-1 text-slate-300 max-h-40 overflow-y-auto">
                  {summary.logs.map((log, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-blue-400 select-none">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processed Data Preview */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Processed Features Snapshot
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-56">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        {summary.columns_meta.slice(0, 8).map((c) => (
                          <th key={c.name} className="py-2 px-3 whitespace-nowrap">{c.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.preview.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {summary.columns_meta.slice(0, 8).map((c) => (
                            <td key={c.name} className="py-1.5 px-3 whitespace-nowrap text-slate-800">
                              {String(row[c.name])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 flex flex-col items-center justify-center min-h-[360px]">
              <Layers className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Ready to Preprocess Data</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Choose transformation settings on the left and click "Execute Preprocessing Pipeline" to generate clean, normalized features.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
