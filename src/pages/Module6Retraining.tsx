import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { RetrainResult } from '../types';
import {
  Wrench, Play, CheckCircle2, ArrowRight, RefreshCw, Zap,
  Sliders, Settings, ArrowUpRight, Award, ShieldCheck
} from 'lucide-react';

export const Module6Retraining: React.FC = () => {
  const {
    activeExperiment,
    activeModel,
    setActiveModel,
    setActiveModule,
    showNotification,
    refreshHistory
  } = useApp();

  const [tuningMethod, setTuningMethod] = useState<string>('grid');
  const [handleImbalance, setHandleImbalance] = useState<boolean>(true);
  const [featureSelection, setFeatureSelection] = useState<boolean>(true);
  const [cvFolds, setCvFolds] = useState<number>(3);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [retrainResult, setRetrainResult] = useState<RetrainResult | null>(null);

  const handleRetrain = async () => {
    if (!activeExperiment || !activeModel) return;

    setIsRetraining(true);
    try {
      const res = await api.improveModel({
        experiment_id: activeExperiment.experiment_id,
        model_id: activeModel.model_id,
        tuning_method: tuningMethod,
        handle_imbalance: handleImbalance,
        feature_selection: featureSelection,
        cv_folds: cvFolds,
      });

      setRetrainResult(res);
      await refreshHistory();
      showNotification('success', `Model retraining complete! Tuned model serialized to saved_models/improved/`);
    } catch (err: any) {
      showNotification('error', err.message || 'Model retraining failed');
    } finally {
      setIsRetraining(false);
    }
  };

  if (!activeExperiment) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Wrench className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Baseline Model to Retrain</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please run baseline model training in Module 4 before configuring hyperparameter grid search.
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

  const modelToRetrain = activeModel || activeExperiment.models[0];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Module 6: Optimization &amp; Retraining
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Model Improvement &amp; Retraining</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimize hyperparameters via cross-validated GridSearchCV, apply class imbalance weighting, and serialize improved pipelines.
          </p>
        </div>

        {retrainResult && (
          <button
            onClick={() => setActiveModule(7)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <span>Proceed to Performance Comparison</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Retrain Setup & Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            <Settings className="w-4 h-4 text-blue-600" />
            <span>Optimization Parameters</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Model for Retraining</label>
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">
              {modelToRetrain.name} ({modelToRetrain.model_type})
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hyperparameter Search Strategy</label>
            <select
              value={tuningMethod}
              onChange={(e) => setTuningMethod(e.target.value)}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 font-medium text-slate-800"
            >
              <option value="grid">GridSearchCV (Exhaustive Cross-Validated Search)</option>
              <option value="random">RandomizedSearchCV (Stochastic Param Sampling)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cross-Validation Folds (K-Fold)</label>
            <select
              value={cvFolds}
              onChange={(e) => setCvFolds(parseInt(e.target.value, 10))}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 font-medium text-slate-800"
            >
              <option value={2}>2-Fold Cross Validation (Faster)</option>
              <option value={3}>3-Fold Cross Validation (Standard)</option>
              <option value={5}>5-Fold Stratified K-Fold (Rigorous)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <div>
                <span>Class Imbalance Weighting</span>
                <p className="text-[11px] text-slate-400 font-normal">Apply class_weight="balanced" penalty</p>
              </div>
              <input
                type="checkbox"
                checked={handleImbalance}
                onChange={(e) => setHandleImbalance(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100">
              <div>
                <span>Feature Pruning &amp; Selection</span>
                <p className="text-[11px] text-slate-400 font-normal">Retain highest f-score predictors</p>
              </div>
              <input
                type="checkbox"
                checked={featureSelection}
                onChange={(e) => setFeatureSelection(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isRetraining ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running GridSearch &amp; Retraining...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Execute Hyperparameter Optimization</span>
              </>
            )}
          </button>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-2 space-y-4">
          {retrainResult ? (
            <>
              {/* Retrained Banner */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900">{retrainResult.model_name}</h3>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                    ID: {retrainResult.improved_model_id}
                  </span>
                </div>

                {/* Best Hyperparameters Discovered */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Optimal Hyperparameters Selected via CV
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                    {Object.entries(retrainResult.best_params).map(([param, val]) => (
                      <div key={param} className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-400 block truncate">{param}</span>
                        <span className="font-bold text-slate-800">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metric Delta Comparison */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Metric Performance Delta
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(retrainResult.improved_metrics).map(([metric, impVal]) => {
                      const baseVal = retrainResult.baseline_metrics[metric] || 0;
                      const diff = Number((impVal - baseVal).toFixed(4));
                      const isPositive = diff > 0;
                      return (
                        <div key={metric} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-500 truncate block">
                            {metric.replace('_', ' ')}
                          </span>
                          <div className="text-lg font-black text-slate-800 mt-0.5">{impVal}</div>
                          <div className="flex items-center space-x-1 text-[11px] font-semibold mt-0.5">
                            <span className="text-slate-400 font-normal">Base: {baseVal}</span>
                            <span className={isPositive ? 'text-emerald-600' : 'text-slate-500'}>
                              ({isPositive ? `+${diff}` : diff})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Techniques Audit Badge */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-600 block mb-1.5">Applied Techniques:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {retrainResult.techniques_used.map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ✓ {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 flex flex-col items-center justify-center min-h-[360px]">
              <Wrench className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Ready to Retrain and Tune</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Select your optimization settings on the left and click "Execute Hyperparameter Optimization" to conduct cross-validated tuning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
