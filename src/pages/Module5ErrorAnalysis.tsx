import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ErrorAnalysis } from '../types';
import {
  Bug, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw,
  TrendingDown, ShieldAlert, Activity, BarChart3, ScatterChart
} from 'lucide-react';

export const Module5ErrorAnalysis: React.FC = () => {
  const { activeExperiment, activeModel, setActiveModel, setActiveModule, showNotification } = useApp();
  const [analysis, setAnalysis] = useState<ErrorAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchErrorAnalysis = async (modelId: string) => {
    setIsLoading(true);
    try {
      const data = await api.getErrorAnalysis(modelId);
      setAnalysis(data);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to fetch error analysis');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeModel) {
      fetchErrorAnalysis(activeModel.model_id);
    } else if (activeExperiment?.models && activeExperiment.models.length > 0) {
      const best = activeExperiment.models.find((m) => m.is_best) || activeExperiment.models[0];
      setActiveModel(best);
      fetchErrorAnalysis(best.model_id);
    }
  }, [activeModel?.model_id, activeExperiment?.experiment_id]);

  if (!activeExperiment) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Bug className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Trained Models Available</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please run AutoML training in Module 4 to evaluate model predictions and diagnostic errors.
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

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Module 5: Diagnostic Evaluation
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Model Error Analysis</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deep inspection of test set failures: Confusion Matrix, class-specific False Positives &amp; False Negatives, and Residual error distributions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Model Switcher */}
          <select
            value={activeModel?.model_id || ''}
            onChange={(e) => {
              const selected = activeExperiment.models.find((m) => m.model_id === e.target.value);
              if (selected) {
                setActiveModel(selected);
              }
            }}
            className="text-xs rounded-xl border-slate-200 bg-slate-50 p-2 font-medium text-slate-800"
          >
            {activeExperiment.models.map((m) => (
              <option key={m.model_id} value={m.model_id}>
                {m.name} {m.is_best ? '★ (Best)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={() => setActiveModule(6)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <span>Proceed to Improvement &amp; Retraining</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Computing Error Matrices...</h3>
          <p className="text-xs text-slate-500 mt-1">Evaluating test set residuals and class misallocations.</p>
        </div>
      ) : analysis ? (
        <>
          {/* Key Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analysis.problem_type === 'classification' && analysis.classification_error ? (
              <>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Test Samples</span>
                  <div className="text-2xl font-black text-slate-800 mt-1">{analysis.classification_error.total_samples}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-600">Correct Predictions</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{analysis.classification_error.correct_predictions}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-rose-600">Incorrect (Errors)</span>
                  <div className="text-2xl font-black text-rose-600 mt-1">{analysis.classification_error.incorrect_predictions}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Error Rate</span>
                  <div className="text-2xl font-black text-rose-500 mt-1">{analysis.classification_error.error_rate_pct}%</div>
                </div>
              </>
            ) : analysis.regression_error ? (
              <>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Mean Abs Error (MAE)</span>
                  <div className="text-2xl font-black text-blue-700 mt-1">{analysis.regression_error.mae}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Root Mean Sq Error (RMSE)</span>
                  <div className="text-2xl font-black text-slate-800 mt-1">{analysis.regression_error.rmse}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500">R² Coefficient</span>
                  <div className="text-2xl font-black text-indigo-600 mt-1">{analysis.regression_error.r2_score}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Mean Residual Bias</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">{analysis.regression_error.mean_residual}</div>
                </div>
              </>
            ) : null}
          </div>

          {/* Model Weaknesses & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-amber-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Detected Model Weaknesses &amp; Error Patterns</span>
              </h3>
              <ul className="mt-3 space-y-2">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-amber-950 font-medium">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-blue-900 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                <span>Actionable Retraining Recommendations</span>
              </h3>
              <ul className="mt-3 space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-blue-950 font-medium">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Classification: Confusion Matrix & Class Breakdown */}
          {analysis.problem_type === 'classification' && analysis.classification_error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Confusion Matrix Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Confusion Matrix (Actual vs Predicted)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs font-mono border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 text-slate-400 font-sans text-[11px]">Actual \ Predicted</th>
                        {analysis.classification_error.labels.map((lbl) => (
                          <th key={lbl} className="p-2 bg-slate-100 border border-slate-200 font-bold text-slate-800">
                            {lbl}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.classification_error.confusion_matrix.map((row, rIdx) => {
                        const actualLabel = analysis.classification_error!.labels[rIdx];
                        return (
                          <tr key={rIdx}>
                            <td className="p-2 bg-slate-100 border border-slate-200 font-bold text-slate-800">
                              {actualLabel}
                            </td>
                            {row.map((val, cIdx) => {
                              const isDiagonal = rIdx === cIdx;
                              return (
                                <td
                                  key={cIdx}
                                  className={`p-3 border border-slate-200 text-sm font-bold ${
                                    isDiagonal
                                      ? 'bg-emerald-50 text-emerald-800'
                                      : val > 0
                                      ? 'bg-rose-50 text-rose-700'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 italic text-center">
                  Green diagonal represents True Positives / Negatives. Off-diagonal represents Misclassifications.
                </div>
              </div>

              {/* Per-Class FP / FN Breakdown Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Class-Wise False Positives &amp; False Negatives
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Class</th>
                        <th className="py-2 px-3">True Pos</th>
                        <th className="py-2 px-3">False Pos</th>
                        <th className="py-2 px-3">False Neg</th>
                        <th className="py-2 px-3">Recall</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analysis.classification_error.class_breakdown.map((item) => (
                        <tr key={item.class} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-800">{item.class}</td>
                          <td className="py-2 px-3 text-emerald-600 font-semibold">{item.true_positives}</td>
                          <td className="py-2 px-3 text-rose-600 font-semibold">{item.false_positives}</td>
                          <td className="py-2 px-3 text-amber-600 font-semibold">{item.false_negatives}</td>
                          <td className="py-2 px-3 font-bold text-blue-700">{Math.round(item.recall * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Regression: Actual vs Predicted & Residuals Table */}
          {analysis.problem_type === 'regression' && analysis.regression_error && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Actual vs. Predicted Sample Pairs &amp; Residuals</span>
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-72">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Actual Value</th>
                      <th className="py-2 px-3">Predicted Value</th>
                      <th className="py-2 px-3">Residual (Actual - Pred)</th>
                      <th className="py-2 px-3">Deviation %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysis.regression_error.actual_vs_pred.map((row, idx) => {
                      const devPct = row.actual !== 0 ? Math.abs((row.residual / row.actual) * 100).toFixed(1) : '0';
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{row.actual}</td>
                          <td className="py-2 px-3 text-blue-700 font-bold">{row.predicted}</td>
                          <td className={`py-2 px-3 font-semibold ${row.residual >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {row.residual > 0 ? `+${row.residual}` : row.residual}
                          </td>
                          <td className="py-2 px-3 text-slate-600">{devPct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
