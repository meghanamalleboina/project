import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    row_count = Column(Integer, default=0)
    col_count = Column(Integer, default=0)
    columns_meta = Column(JSON, default=list) # List of dicts {name, dtype, sample_values, is_numerical}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    diagnoses = relationship("DatasetDiagnosis", back_populates="dataset", cascade="all, delete-orphan")
    preprocessing_logs = relationship("PreprocessingLog", back_populates="dataset", cascade="all, delete-orphan")
    experiments = relationship("Experiment", back_populates="dataset", cascade="all, delete-orphan")

class DatasetDiagnosis(Base):
    __tablename__ = "dataset_diagnoses"

    id = Column(String, primary_key=True, index=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    quality_score = Column(Float, default=100.0)
    missing_report = Column(JSON, default=dict)
    duplicate_report = Column(JSON, default=dict)
    dtypes_report = Column(JSON, default=dict)
    outliers_report = Column(JSON, default=dict)
    constant_cols = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    dataset = relationship("Dataset", back_populates="diagnoses")

class PreprocessingLog(Base):
    __tablename__ = "preprocessing_logs"

    id = Column(String, primary_key=True, index=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    operations_applied = Column(JSON, default=list)
    rows_before = Column(Integer, default=0)
    rows_after = Column(Integer, default=0)
    missing_handled = Column(Integer, default=0)
    processed_filepath = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    dataset = relationship("Dataset", back_populates="preprocessing_logs")

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String, primary_key=True, index=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    target_column = Column(String, nullable=False)
    problem_type = Column(String, nullable=False) # "classification" | "regression"
    best_model_name = Column(String, nullable=True)
    baseline_metrics = Column(JSON, default=dict)
    improved_metrics = Column(JSON, default=dict)
    status = Column(String, default="completed") # in_progress, completed, failed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    dataset = relationship("Dataset", back_populates="experiments")
    models = relationship("TrainedModel", back_populates="experiment", cascade="all, delete-orphan")
    predictions = relationship("PredictionRecord", back_populates="experiment", cascade="all, delete-orphan")
    reports = relationship("ReportRecord", back_populates="experiment", cascade="all, delete-orphan")

class TrainedModel(Base):
    __tablename__ = "trained_models"

    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    model_name = Column(String, nullable=False)
    model_type = Column(String, nullable=False) # "baseline" | "improved"
    metrics = Column(JSON, default=dict)
    evaluation_details = Column(JSON, default=dict) # confusion matrix, residuals, errors
    model_path = Column(String, nullable=False)
    pipeline_path = Column(String, nullable=False)
    feature_names = Column(JSON, default=list)
    hyperparameters = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    experiment = relationship("Experiment", back_populates="models")
    predictions = relationship("PredictionRecord", back_populates="model", cascade="all, delete-orphan")

class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(String, primary_key=True, index=True)
    model_id = Column(String, ForeignKey("trained_models.id"), nullable=False)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    input_data = Column(JSON, default=dict)
    prediction_value = Column(String, nullable=False)
    prediction_proba = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    model = relationship("TrainedModel", back_populates="predictions")
    experiment = relationship("Experiment", back_populates="predictions")

class FeatureImportanceRecord(Base):
    __tablename__ = "feature_importance_records"

    id = Column(String, primary_key=True, index=True)
    model_id = Column(String, ForeignKey("trained_models.id"), nullable=False)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    method = Column(String, nullable=False) # "model_internal" | "permutation"
    feature_scores = Column(JSON, default=list) # [{feature: name, score: val, rank: int}]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ReportRecord(Base):
    __tablename__ = "report_records"

    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    file_size_bytes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    experiment = relationship("Experiment", back_populates="reports")
