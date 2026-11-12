from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import datetime

class ColumnMeta(BaseModel):
    name: str
    dtype: str
    is_numerical: bool
    is_categorical: bool
    null_count: int
    unique_count: int
    sample_values: List[Any]

class DatasetResponse(BaseModel):
    id: str
    filename: str
    original_name: str
    row_count: int
    col_count: int
    columns_meta: List[ColumnMeta]
    preview: List[Dict[str, Any]]
    created_at: Optional[datetime.datetime] = None

class MistakesDetectionResponse(BaseModel):
    dataset_id: str
    quality_score: float
    missing_report: Dict[str, Any]
    duplicate_report: Dict[str, Any]
    dtypes_report: Dict[str, Any]
    outliers_report: Dict[str, Any]
    constant_cols: List[str]
    column_analysis: List[Dict[str, Any]]
    recommendations: List[str]

class PreprocessingRequest(BaseModel):
    dataset_id: str
    handle_missing: bool = True
    missing_strategy: str = "mean" # "mean", "median", "mode", "drop"
    remove_duplicates: bool = True
    encoding: str = "one_hot" # "one_hot", "label", "none"
    scaling: str = "standard" # "standard", "minmax", "none"
    outlier_treatment: str = "iqr_clip" # "iqr_clip", "iqr_remove", "none"
    feature_selection: bool = False
    k_best: int = 10

class PreprocessingResponse(BaseModel):
    dataset_id: str
    processed_dataset_id: str
    operations_applied: List[str]
    rows_before: int
    rows_after: int
    missing_handled: int
    preview: List[Dict[str, Any]]
    columns_meta: List[ColumnMeta]
    logs: List[str]

class TrainRequest(BaseModel):
    dataset_id: str
    target_column: str
    problem_type: Optional[str] = "auto" # "auto", "classification", "regression"
    test_size: float = 0.2
    selected_algorithms: Optional[List[str]] = None

class TrainedModelSummary(BaseModel):
    model_id: str
    name: str
    algorithm: str
    model_type: str # "baseline" | "improved"
    metrics: Dict[str, float]
    is_best: bool = False
    evaluation: Dict[str, Any]

class TrainResponse(BaseModel):
    experiment_id: str
    dataset_id: str
    target_column: str
    problem_type: str
    best_model_name: str
    models: List[TrainedModelSummary]
    training_logs: List[str]

class ErrorAnalysisResponse(BaseModel):
    model_id: str
    model_name: str
    problem_type: str
    metrics: Dict[str, float]
    classification_error: Optional[Dict[str, Any]] = None
    regression_error: Optional[Dict[str, Any]] = None
    weaknesses: List[str]
    recommendations: List[str]

class RetrainRequest(BaseModel):
    experiment_id: str
    model_id: str
    tuning_method: str = "grid" # "grid", "random"
    handle_imbalance: bool = True
    feature_selection: bool = True
    n_features: int = 8
    cv_folds: int = 3

class RetrainResponse(BaseModel):
    improved_model_id: str
    experiment_id: str
    model_name: str
    baseline_metrics: Dict[str, float]
    improved_metrics: Dict[str, float]
    best_params: Dict[str, Any]
    improvements: Dict[str, Any]
    techniques_used: List[str]

class PredictRequest(BaseModel):
    model_id: str
    input_data: Dict[str, Any]

class PredictResponse(BaseModel):
    prediction_id: str
    model_id: str
    prediction: Any
    probabilities: Optional[Dict[str, float]] = None
    timestamp: str

class BatchPredictResponse(BaseModel):
    total_samples: int
    predictions: List[Any]
    download_url: str

class ExplainRequest(BaseModel):
    model_id: str
    sample_input: Optional[Dict[str, Any]] = None

class ExplainResponse(BaseModel):
    model_id: str
    model_name: str
    method: str
    feature_importance: List[Dict[str, Any]]
    ranking: List[str]
    sample_explanation: Optional[Dict[str, Any]] = None
    interpretation_notes: List[str]

class ExperimentHistoryItem(BaseModel):
    id: str
    dataset_id: str
    dataset_name: str
    target_column: str
    problem_type: str
    best_model: str
    baseline_metrics: Dict[str, Any]
    improved_metrics: Optional[Dict[str, Any]] = None
    status: str
    created_at: str
    has_report: bool

class DashboardSummaryResponse(BaseModel):
    total_datasets: int
    total_experiments: int
    total_models: int
    total_predictions: int
    total_reports: int
    activity_timeline: List[Dict[str, Any]]
    quality_overview: List[Dict[str, Any]]
    model_performance_overview: List[Dict[str, Any]]
    recent_experiments: List[Dict[str, Any]]
    recent_datasets: List[Dict[str, Any]]
    best_models: List[Dict[str, Any]]
