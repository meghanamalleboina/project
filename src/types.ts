export interface ColumnMeta {
  name: string;
  dtype: string;
  is_numerical: boolean;
  is_categorical: boolean;
  null_count: number;
  unique_count: number;
  sample_values: (string | number)[];
}

export interface Dataset {
  id: string;
  filename: string;
  original_name: string;
  row_count: number;
  col_count: number;
  columns_meta: ColumnMeta[];
  preview: Record<string, any>[];
  created_at?: string;
}

export interface MistakesDetectionReport {
  dataset_id: string;
  quality_score: number;
  missing_report: {
    total_missing_cells: number;
    missing_cell_percentage: number;
    columns_with_missing: Record<string, { count: number; percentage: number }>;
    has_missing: boolean;
  };
  duplicate_report: {
    count: number;
    percentage: number;
    has_duplicates: boolean;
  };
  dtypes_report: {
    columns: Record<string, { dtype: string; unique_values: number; type_category: string }>;
    type_mismatches: Array<{ column: string; current_dtype: string; suggested_dtype: string; reason: string }>;
  };
  outliers_report: {
    total_outliers_detected: number;
    columns_with_outliers: Record<string, { count: number; percentage: number; lower_bound: number; upper_bound: number; min: number; max: number }>;
    has_outliers: boolean;
  };
  constant_cols: string[];
  column_analysis: Array<{
    column: string;
    quality_score: number;
    status: 'healthy' | 'warning' | 'critical';
    missing_count: number;
    unique_count: number;
    outliers_count: number;
    is_constant: boolean;
  }>;
  recommendations: string[];
}

export interface PreprocessingSummary {
  dataset_id: string;
  processed_dataset_id: string;
  operations_applied: string[];
  rows_before: number;
  rows_after: number;
  missing_handled: number;
  preview: Record<string, any>[];
  columns_meta: ColumnMeta[];
  logs: string[];
}

export interface TrainedModelSummary {
  model_id: string;
  name: string;
  algorithm: string;
  model_type: 'baseline' | 'improved';
  metrics: Record<string, number>;
  is_best: boolean;
  evaluation: any;
  feature_names?: string[];
}

export interface Experiment {
  experiment_id: string;
  dataset_id: string;
  target_column: string;
  problem_type: 'classification' | 'regression';
  best_model_name: string;
  models: TrainedModelSummary[];
  training_logs: string[];
  improved_model?: TrainedModelSummary;
}

export interface ErrorAnalysis {
  model_id: string;
  model_name: string;
  problem_type: string;
  metrics: Record<string, number>;
  classification_error?: {
    confusion_matrix: number[][];
    labels: string[];
    total_samples: number;
    correct_predictions: number;
    incorrect_predictions: number;
    error_rate_pct: number;
    class_breakdown: Array<{
      class: string;
      true_positives: number;
      false_positives: number;
      false_negatives: number;
      precision: number;
      recall: number;
    }>;
  };
  regression_error?: {
    residuals: number[];
    mean_residual: number;
    std_residual: number;
    actual_vs_pred: Array<{ actual: number; predicted: number; residual: number }>;
    mae: number;
    rmse: number;
    r2_score: number;
  };
  weaknesses: string[];
  recommendations: string[];
}

export interface RetrainResult {
  improved_model_id: string;
  experiment_id: string;
  model_name: string;
  baseline_metrics: Record<string, number>;
  improved_metrics: Record<string, number>;
  best_params: Record<string, any>;
  improvements: Record<string, { diff: number; pct: number }>;
  techniques_used: string[];
}

export interface ModelComparison {
  experiment_id: string;
  problem_type: string;
  baseline_model: string;
  improved_model: string;
  has_improved: boolean;
  comparison: Array<{
    metric: string;
    baseline: number;
    improved: number;
    diff: number;
    pct_change: number;
    is_improved: boolean;
  }>;
}

export interface FeatureImportanceItem {
  feature: string;
  importance_score: number;
  rank: number;
  direction: string;
}

export interface ExplainabilityResult {
  model_id: string;
  model_name: string;
  method: string;
  feature_importance: FeatureImportanceItem[];
  ranking: string[];
  sample_explanation?: {
    prediction: string;
    contributions: Array<{
      feature: string;
      value: string;
      baseline_value: string;
      impact: number;
      influence: string;
    }>;
  };
  interpretation_notes: string[];
}

export interface ExperimentHistoryItem {
  id: string;
  dataset_id: string;
  dataset_name: string;
  target_column: string;
  problem_type: string;
  best_model: string;
  baseline_metrics: Record<string, any>;
  improved_metrics?: Record<string, any>;
  status: string;
  created_at: string;
  has_report: boolean;
  report_filename?: string;
}

export interface DashboardStats {
  total_datasets: number;
  total_experiments: number;
  total_models: number;
  total_predictions: number;
  total_reports: number;
  activity_timeline: Array<{ name: string; rows: number; columns: number }>;
  quality_overview: Array<{ range: string; count: number }>;
  model_performance_overview: Array<{ name: string; score: number; type: string }>;
  recent_experiments: Array<{
    id: string;
    dataset_name: string;
    target_column: string;
    problem_type: string;
    best_model: string;
    created_at: string;
  }>;
  recent_datasets: Array<{
    id: string;
    original_name: string;
    row_count: number;
    col_count: number;
    quality_score: number | null;
    created_at: string;
  }>;
  best_models: Array<{
    model_id: string;
    name: string;
    type: string;
    experiment_id: string;
    problem_type: string;
    metrics: Record<string, number>;
  }>;
}
