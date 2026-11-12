import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ExplainabilityResult } from '../types';
import {
  Sparkles, ArrowRight, RefreshCw, BarChart2, Info,
  CheckCircle2, AlertCircle, Award, ListFilter
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from 'recharts';

export const Module9Explainability: React.FC = () => {
  const { activeExperiment, activeModel, setActiveModel, setActiveModule, showNotification } = useApp();
  const [explainResult, setExplainResult] = useState<ExplainabilityResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchExplainability = async (modelId: string) => {
    setIsLoading(true);
    try {
      const data = await api.getExplainability(modelId);
      setExplainResult(data);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to compute Explainable AI');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeModel) {
      fetchExplainability(activeModel.model_id);
    } else if (activeExperiment?.models && activeExperiment.models.length > 0) {
      const best = activeExperiment.models.find((m) => m.is_best) || activeExperiment.models[0];
      setActiveModel(best);
      fetchExplainability(best.model_id);
    }
  }, [activeModel?.model_id, activeExperiment?.experiment_id]);

  if (!activeExperiment) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Model Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please run AutoML training in Module 4 to inspect feature attribution and model transparency.
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

  const modelToExplain = activeModel || activeExperiment.models[0];

  const chartData = explainResult?.feature_importance.slice(0, 10).map((item) => ({
    feature: item.feature,
    importance: item.importance_score,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Module 9: Model Interpretability (XAI)
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Explainable AI (XAI) &amp; Feature Attribution</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent, model-agnostic Permutation Importance measuring variance impact, feature rankings, and individual prediction drivers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={modelToExplain.model_id}
            onChange={(e) => {
              const m = activeExperiment.models.find((item) => item.model_id === e.target.value);
              if (m) {
                setActiveModel(m);
                fetchExplainability(m.model_id);
              }
            }}
            className="text-xs rounded-xl border-slate-200 bg-slate-50 p-2 font-medium text-slate-800"
          >
            {activeExperiment.models.map((m) => (
              <option key={m.model_id} value={m.model_id}>
                {m.name} ({m.model_type})
              </option>
            ))}
          </select>

          <button
            onClick={() => setActiveModule(10)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <span>Proceed to Database Storage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Calculating Permutation Importances...</h3>
          <p className="text-xs text-slate-500 mt-1">Executing multi-repeat feature shuffling and variance sensitivity testing.</p>
        </div>
      ) : explainResult ? (
        <>
          {/* Top Feature Drivers Highlight Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md">
            <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block mb-1">
              Primary Prediction Driver
            </span>
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                {explainResult.ranking[0] || 'Primary Feature'}
              </span>
              <span className="text-sm text-blue-200 font-medium">
                (Highest Permutation Importance Weight)
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {explainResult.ranking.slice(1, 5).map((feat, i) => (
                <span key={feat} className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-blue-100 font-mono">
                  #{i + 2}: {feat}
                </span>
              ))}
            </div>
          </div>

          {/* Chart & Ranking Table Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Importance Bar Chart */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>Feature Importance Weights (Top 10)</span>
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis dataKey="feature" type="category" tick={{ fontSize: 11, fill: '#334155' }} />
                    <Tooltip
                      formatter={(val: any) => [Number(val).toFixed(4), 'Importance Weight']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, borderColor: '#cbd5e1', fontSize: 12 }}
                    />
                    <Bar dataKey="importance" fill="#2563eb" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#1d4ed8' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Ranking Table */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <ListFilter className="w-4 h-4 text-blue-600" />
                <span>Feature Ranking Audit Table</span>
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-72">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Feature Name</th>
                      <th className="py-2.5 px-3">Normalized Score</th>
                      <th className="py-2.5 px-3">Influence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {explainResult.feature_importance.map((item) => (
                      <tr key={item.feature} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-700">#{item.rank}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{item.feature}</td>
                        <td className="py-2.5 px-3 text-blue-700 font-bold">{item.importance_score}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              item.rank <= 3
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.rank <= 3 ? 'High Driver' : 'Moderate'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Model Interpretation & Methodology Notes */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Transparent Interpretability Audit Notes</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {explainResult.interpretation_notes.map((note, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
};
