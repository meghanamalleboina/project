import {
  Dataset, MistakesDetectionReport, PreprocessingSummary, Experiment,
  ErrorAnalysis, RetrainResult, ModelComparison, ExplainabilityResult,
  ExperimentHistoryItem, DashboardStats
} from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async uploadCSV(file: File): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Failed to upload CSV dataset');
    }
    return res.json();
  },

  async loadSampleDataset(sampleType: 'churn' | 'housing' | 'quality_stress'): Promise<Dataset> {
    const formData = new FormData();
    formData.append('sample_type', sampleType);
    const res = await fetch(`${API_BASE}/datasets/samples/load`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to load sample' }));
      throw new Error(err.detail || 'Failed to load sample dataset');
    }
    return res.json();
  },

  async getDataset(datasetId: string): Promise<Dataset> {
    const res = await fetch(`${API_BASE}/datasets/${datasetId}`);
    if (!res.ok) throw new Error('Dataset not found');
    return res.json();
  },

  async detectMistakes(datasetId: string): Promise<MistakesDetectionReport> {
    const res = await fetch(`${API_BASE}/datasets/${datasetId}/mistakes`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Mistakes detection failed' }));
      throw new Error(err.detail || 'Failed to detect dataset mistakes');
    }
    return res.json();
  },

  async runPreprocessing(params: {
    dataset_id: string;
    handle_missing: boolean;
    missing_strategy: string;
    remove_duplicates: boolean;
    encoding: string;
    scaling: string;
    outlier_treatment: string;
    feature_selection?: boolean;
    k_best?: number;
  }): Promise<PreprocessingSummary> {
    const res = await fetch(`${API_BASE}/preprocessing/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Preprocessing failed' }));
      throw new Error(err.detail || 'Data preprocessing failed');
    }
    return res.json();
  },

  async trainModels(params: {
    dataset_id: string;
    target_column: string;
    problem_type?: string;
    test_size?: number;
  }): Promise<Experiment> {
    const res = await fetch(`${API_BASE}/training/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Training failed' }));
      throw new Error(err.detail || 'Automated model training failed');
    }
    return res.json();
  },

  async getErrorAnalysis(modelId: string): Promise<ErrorAnalysis> {
    const res = await fetch(`${API_BASE}/evaluation/errors/${modelId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Error analysis failed' }));
      throw new Error(err.detail || 'Model error analysis failed');
    }
    return res.json();
  },

  async improveModel(params: {
    experiment_id: string;
    model_id: string;
    tuning_method?: string;
    handle_imbalance?: boolean;
    feature_selection?: boolean;
    n_features?: number;
    cv_folds?: number;
  }): Promise<RetrainResult> {
    const res = await fetch(`${API_BASE}/training/improve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Retraining failed' }));
      throw new Error(err.detail || 'Model improvement failed');
    }
    return res.json();
  },

  async getComparison(experimentId: string): Promise<ModelComparison> {
    const res = await fetch(`${API_BASE}/evaluation/compare/${experimentId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Comparison failed' }));
      throw new Error(err.detail || 'Performance comparison failed');
    }
    return res.json();
  },

  async runSinglePrediction(modelId: string, inputData: Record<string, any>) {
    const res = await fetch(`${API_BASE}/prediction/single`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_id: modelId, input_data: inputData }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Prediction failed' }));
      throw new Error(err.detail || 'Prediction failed');
    }
    return res.json();
  },

  async runBatchPrediction(modelId: string, file: File) {
    const formData = new FormData();
    formData.append('model_id', modelId);
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/prediction/batch`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Batch prediction failed' }));
      throw new Error(err.detail || 'Batch prediction failed');
    }
    return res.json();
  },

  async getExplainability(modelId: string, sampleInput?: Record<string, any>): Promise<ExplainabilityResult> {
    const res = await fetch(`${API_BASE}/explainability/${modelId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_id: modelId, sample_input: sampleInput }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Explainability failed' }));
      throw new Error(err.detail || 'Failed to compute Explainable AI');
    }
    return res.json();
  },

  async getDatabaseTables() {
    const res = await fetch(`${API_BASE}/database/tables`);
    if (!res.ok) throw new Error('Failed to fetch database schema');
    return res.json();
  },

  async listExperiments(): Promise<ExperimentHistoryItem[]> {
    const res = await fetch(`${API_BASE}/experiments`);
    if (!res.ok) throw new Error('Failed to load experiment history');
    return res.json();
  },

  async getExperimentDetails(experimentId: string) {
    const res = await fetch(`${API_BASE}/experiments/${experimentId}`);
    if (!res.ok) throw new Error('Experiment not found');
    return res.json();
  },

  async deleteExperiment(experimentId: string) {
    const res = await fetch(`${API_BASE}/experiments/${experimentId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete experiment');
    return res.json();
  },

  async generatePDFReport(experimentId: string): Promise<{ report_id: string; filename: string; download_url: string }> {
    const res = await fetch(`${API_BASE}/reports/generate/${experimentId}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Report generation failed' }));
      throw new Error(err.detail || 'PDF report generation failed');
    }
    return res.json();
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to load dashboard statistics');
    return res.json();
  },
};
