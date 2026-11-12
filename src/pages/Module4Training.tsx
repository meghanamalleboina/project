import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Cpu, Play, CheckCircle2, ArrowRight, RefreshCw, Trophy,
  Sliders, ShieldCheck, Terminal, Award
} from 'lucide-react';

export const Module4Training: React.FC = () => {
  const {
    activeDataset,
    activeExperiment,
    setActiveExperiment,
    activeModel,
    setActiveModel,
    setActiveModule,
    showNotification,
    refreshHistory
  } = useApp();

  const [targetColumn, setTargetColumn] = useState<string>(() => {
    if (!activeDataset) return '';
    // Sensible default: churn, price, or last column
    const names = activeDataset.columns_meta.map((c) => c.name);
    return names.find((n) => /churn|target|label|price|class/i.test(n)) || names[names.length - 1];
  });

  const [problemType, setProblemType] = useState<string>('auto');
  const [testSplit, setTestSplit] = useState<number>(0.2);
  const [isTraining, setIsTraining] = useState<boolean>(false);

  const handleStartTraining = async () => {
    if (!activeDataset || !targetColumn) {
      showNotification('error', 'Please select a valid target column to predict.');
      return;
    }

    setIsTraining(true);
    try {
      const exp = await api.trainModels({
        dataset_id: activeDataset.id,
        target_column: targetColumn,
        problem_type: problemType,
        test_size: testSplit,
      });

      setActiveExperiment(exp);
      const best = exp.models.find((m) => m.is_best) || exp.models[0];
      setActiveModel(best);
      await refreshHistory();
      showNotification('success', `Training completed! Best model: ${exp.best_model_name}`);
    } catch (err: any) {
      showNotification('error', err.message || 'Model training failed');
    } finally {
      setIsTraining(false);
    }
  };

  if (!activeDataset) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Cpu className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Dataset Available</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please upload or load a dataset in Module 1 before training machine learning models.
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
            Module 4: AutoML Pipeline
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Automatic ML Model Training</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Train up to 6 Scikit-learn algorithms concurrently with cross-validated pipelines, serialization, and automated leaderboard ranking.
          </p>
        </div>

        {activeExperiment && (
          <button
            onClick={() => setActiveModule(5)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <span>Proceed to Error Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Configuration & Training Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Training Configuration</span>
          </div>

          {/* Target Column Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Target (Label / Outcome) Column:
            </label>
            <select
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2.5 font-mono font-semibold text-blue-700 focus:ring-blue-500"
            >
              {activeDataset.columns_meta.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.dtype} - {col.unique_count} unique)
                </option>
              ))}
            </select>
          </div>

          {/* Problem Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Problem Formulation</label>
            <select
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
              className="w-full text-xs rounded-xl border-slate-200 bg-slate-50 p-2 font-medium text-slate-800"
            >
              <option value="auto">Auto-Detect (Classification or Regression)</option>
              <option value="classification">Classification (Discrete / Categorical Target)</option>
              <option value="regression">Regression (Continuous Numerical Target)</option>
            </select>
          </div>

          {/* Test Split Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Test Split Ratio</span>
              <span className="font-mono text-blue-600 font-bold">{Math.round(testSplit * 100)}% Test / {Math.round((1 - testSplit) * 100)}% Train</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.4"
              step="0.05"
              value={testSplit}
              onChange={(e) => setTestSplit(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Supported Algorithms Info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Candidate Algorithms Evaluated:</span>
            <p>• Classification: Logistic Regression, Decision Tree, Random Forest, SVM, KNN, Gradient Boosting</p>
            <p>• Regression: Linear Regression, Decision Tree, Random Forest, Gradient Boosting</p>
          </div>

          {/* Train Button */}
          <button
            onClick={handleStartTraining}
            disabled={isTraining}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isTraining ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Fitting Pipelines &amp; Evaluating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Launch AutoML Training</span>
              </>
            )}
          </button>
        </div>

        {/* Leaderboard & Training Results */}
        <div className="lg:col-span-2 space-y-4">
          {activeExperiment ? (
            <>
              {/* Leaderboard Table */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Model Leaderboard ({activeExperiment.problem_type.toUpperCase()})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    Target: <b className="font-mono text-slate-700">{activeExperiment.target_column}</b>
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Algorithm</th>
                        {activeExperiment.problem_type === 'classification' ? (
                          <>
                            <th className="py-2.5 px-3">F1 Score</th>
                            <th className="py-2.5 px-3">Accuracy</th>
                            <th className="py-2.5 px-3">Precision</th>
                            <th className="py-2.5 px-3">Recall</th>
                          </>
                        ) : (
                          <>
                            <th className="py-2.5 px-3">R² Score</th>
                            <th className="py-2.5 px-3">RMSE</th>
                            <th className="py-2.5 px-3">MAE</th>
                          </>
                        )}
                        <th className="py-2.5 px-3">Select</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {activeExperiment.models.map((model, idx) => {
                        const isSelected = activeModel?.model_id === model.model_id;
                        return (
                          <tr
                            key={model.model_id}
                            className={`transition-colors ${
                              model.is_best ? 'bg-amber-50/40 font-semibold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              {model.is_best ? (
                                <span className="flex items-center space-x-1 text-amber-600 font-bold">
                                  <Award className="w-4 h-4" />
                                  <span>#1</span>
                                </span>
                              ) : (
                                <span className="text-slate-400">#{idx + 1}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                              <div className="flex items-center space-x-1.5">
                                <span>{model.name}</span>
                                {model.is_best && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                                    BEST
                                  </span>
                                )}
                              </div>
                            </td>

                            {activeExperiment.problem_type === 'classification' ? (
                              <>
                                <td className="py-2.5 px-3 text-blue-700 font-bold">{model.metrics.f1_score}</td>
                                <td className="py-2.5 px-3">{model.metrics.accuracy}</td>
                                <td className="py-2.5 px-3">{model.metrics.precision}</td>
                                <td className="py-2.5 px-3">{model.metrics.recall}</td>
                              </>
                            ) : (
                              <>
                                <td className="py-2.5 px-3 text-blue-700 font-bold">{model.metrics.r2_score}</td>
                                <td className="py-2.5 px-3">{model.metrics.rmse}</td>
                                <td className="py-2.5 px-3">{model.metrics.mae}</td>
                              </>
                            )}

                            <td className="py-2.5 px-3 font-sans">
                              <button
                                onClick={() => setActiveModel(model)}
                                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                                  isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {isSelected ? 'Active' : 'Inspect'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Training Logs Console */}
              <div className="bg-slate-900 rounded-2xl p-4 text-white font-mono text-xs shadow-md">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-slate-200">AutoML Training Console Output</span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono">Joblib Serialized</span>
                </div>
                <div className="space-y-1 text-slate-300 max-h-36 overflow-y-auto">
                  {activeExperiment.training_logs.map((log, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-blue-400 select-none">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 flex flex-col items-center justify-center min-h-[360px]">
              <Cpu className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Ready to Train Algorithms</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Confirm your target column on the left and click "Launch AutoML Training" to automatically benchmark models.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
