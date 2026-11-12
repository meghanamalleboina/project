import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  TrendingUp, Play, CheckCircle2, ArrowRight, Upload,
  Download, History, FileText, Sparkles, RefreshCw
} from 'lucide-react';

export const Module8Prediction: React.FC = () => {
  const { activeExperiment, activeModel, setActiveModel, setActiveModule, showNotification } = useApp();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predictionHistory, setPredictionHistory] = useState<any[]>([]);

  // Batch states
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [batchResult, setBatchResult] = useState<any>(null);

  if (!activeExperiment) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Trained Model Available</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please run model training in Module 4 to enable inference and dynamic predictions.
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

  const modelToUse = activeModel || activeExperiment.models[0];
  const featureNames = modelToUse.feature_names || [];

  const handleInputChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSinglePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    try {
      const res = await api.runSinglePrediction(modelToUse.model_id, formData);
      setPredictionResult(res);
      setPredictionHistory((prev) => [res, ...prev]);
      showNotification('success', `Prediction calculated: ${res.prediction}`);
    } catch (err: any) {
      showNotification('error', err.message || 'Prediction failed');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleBatchPrediction = async () => {
    if (!batchFile) return;
    setIsBatchRunning(true);
    try {
      const res = await api.runBatchPrediction(modelToUse.model_id, batchFile);
      setBatchResult(res);
      showNotification('success', `Batch inference completed for ${res.total_samples} records!`);
    } catch (err: any) {
      showNotification('error', err.message || 'Batch prediction failed');
    } finally {
      setIsBatchRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Module 8: Predictive Inference Engine
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Prediction &amp; Batch Scoring</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute single-sample inference via dynamic validated input fields, or score thousands of records in batch mode with CSV export.
          </p>
        </div>

        <button
          onClick={() => setActiveModule(9)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
        >
          <span>Proceed to Explainable AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Single Inference Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Dynamic Feature Input Form</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Active Model:</span>
              <select
                value={modelToUse.model_id}
                onChange={(e) => {
                  const m = activeExperiment.models.find((item) => item.model_id === e.target.value);
                  if (m) setActiveModel(m);
                }}
                className="text-xs font-semibold rounded-lg border-slate-200 bg-slate-50 p-1.5 text-blue-700"
              >
                {activeExperiment.models.map((m) => (
                  <option key={m.model_id} value={m.model_id}>
                    {m.name} ({m.model_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleSinglePrediction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
              {featureNames.map((feat) => (
                <div key={feat}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono truncate" title={feat}>
                    {feat}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`Enter value for ${feat}`}
                    value={formData[feat] || ''}
                    onChange={(e) => handleInputChange(feat, e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isPredicting || featureNames.length === 0}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isPredicting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Prediction...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Generate Single Prediction</span>
                </>
              )}
            </button>
          </form>

          {/* Single Prediction Result Box */}
          {predictionResult && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-blue-700">Model Prediction Outcome</span>
                <span className="text-[10px] font-mono text-slate-500">ID: {predictionResult.prediction_id}</span>
              </div>
              <div className="text-3xl font-black text-blue-900 font-mono">
                {String(predictionResult.prediction)}
              </div>

              {predictionResult.probabilities && (
                <div className="pt-2 border-t border-blue-200/60">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">Class Probabilities:</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(predictionResult.probabilities).map(([cls, prob]) => (
                      <div key={cls} className="px-2 py-1 rounded-lg bg-white/80 border border-blue-200 text-xs font-mono">
                        <span className="text-slate-600 font-semibold">{cls}: </span>
                        <span className="font-bold text-blue-800">{Math.round((prob as number) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Batch Inference Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 font-bold text-slate-800 text-sm">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Batch CSV Inference</span>
            </div>
            <p className="text-xs text-slate-500">
              Upload an unlabelled CSV file. NexaDS maps features and appends predicted values into a downloadable scored dataset.
            </p>

            <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50">
              <input
                type="file"
                accept=".csv"
                id="batch-file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setBatchFile(e.target.files[0])}
              />
              <label htmlFor="batch-file" className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 block">
                {batchFile ? batchFile.name : 'Choose CSV for Batch Scoring'}
              </label>
              <span className="text-[10px] text-slate-400 block mt-1">.csv tabular formats</span>
            </div>

            <button
              onClick={handleBatchPrediction}
              disabled={!batchFile || isBatchRunning}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-40"
            >
              {isBatchRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Batch...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Batch Scoring</span>
                </>
              )}
            </button>

            {batchResult && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                <div className="font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{batchResult.total_samples} Records Processed</span>
                </div>
                <a
                  href={batchResult.download_url}
                  download
                  className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Scored CSV</span>
                </a>
              </div>
            )}
          </div>

          {/* Recent Single Predictions List */}
          {predictionHistory.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-slate-800 text-xs">
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>Session Prediction History</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {predictionHistory.slice(0, 5).map((p, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs flex justify-between items-center">
                    <span className="font-mono text-slate-600 truncate max-w-[120px]">{p.prediction_id}</span>
                    <span className="font-bold text-blue-700 font-mono">{String(p.prediction)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
