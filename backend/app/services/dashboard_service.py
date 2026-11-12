from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.db_models import (
    Dataset, Experiment, TrainedModel, PredictionRecord, ReportRecord, DatasetDiagnosis
)

def get_dashboard_summary(db: Session) -> Dict[str, Any]:
    total_datasets = db.query(func.count(Dataset.id)).scalar() or 0
    total_experiments = db.query(func.count(Experiment.id)).scalar() or 0
    total_models = db.query(func.count(TrainedModel.id)).scalar() or 0
    total_predictions = db.query(func.count(PredictionRecord.id)).scalar() or 0
    total_reports = db.query(func.count(ReportRecord.id)).scalar() or 0

    # Recent experiments
    recent_exps = db.query(Experiment).order_by(Experiment.created_at.desc()).limit(5).all()
    recent_exp_list = []
    for exp in recent_exps:
        ds = db.query(Dataset).filter(Dataset.id == exp.dataset_id).first()
        recent_exp_list.append({
            "id": exp.id,
            "dataset_name": ds.original_name if ds else "Dataset",
            "target_column": exp.target_column,
            "problem_type": exp.problem_type,
            "best_model": exp.best_model_name,
            "created_at": exp.created_at.strftime("%Y-%m-%d %H:%M") if exp.created_at else ""
        })

    # Recent datasets
    recent_dss = db.query(Dataset).order_by(Dataset.created_at.desc()).limit(5).all()
    recent_ds_list = []
    for d in recent_dss:
        diag = db.query(DatasetDiagnosis).filter(DatasetDiagnosis.dataset_id == d.id).first()
        recent_ds_list.append({
            "id": d.id,
            "original_name": d.original_name,
            "row_count": d.row_count,
            "col_count": d.col_count,
            "quality_score": diag.quality_score if diag else None,
            "created_at": d.created_at.strftime("%Y-%m-%d %H:%M") if d.created_at else ""
        })

    # Best models
    models = db.query(TrainedModel).order_by(TrainedModel.created_at.desc()).limit(6).all()
    best_models_list = []
    for m in models:
        exp = db.query(Experiment).filter(Experiment.id == m.experiment_id).first()
        best_models_list.append({
            "model_id": m.id,
            "name": m.model_name,
            "type": m.model_type,
            "experiment_id": m.experiment_id,
            "problem_type": exp.problem_type if exp else "classification",
            "metrics": m.metrics
        })

    # Quality overview stats
    diagnoses = db.query(DatasetDiagnosis.quality_score).all()
    scores = [d[0] for d in diagnoses if d[0] is not None]
    quality_overview = [
        {"range": "90-100 (Optimal)", "count": sum(1 for s in scores if s >= 90)},
        {"range": "75-89 (Good)", "count": sum(1 for s in scores if 75 <= s < 90)},
        {"range": "50-74 (Fair)", "count": sum(1 for s in scores if 50 <= s < 75)},
        {"range": "< 50 (Needs Cleaning)", "count": sum(1 for s in scores if s < 50)},
    ]

    # Activity timeline (by day or recent)
    activity_timeline = []
    for d in recent_dss:
        activity_timeline.append({
            "name": d.original_name[:12],
            "rows": d.row_count,
            "columns": d.col_count
        })

    # Model performance overview
    model_performance_overview = []
    for m in best_models_list:
        metric_val = m["metrics"].get("f1_score") or m["metrics"].get("accuracy") or m["metrics"].get("r2_score") or 0.0
        model_performance_overview.append({
            "name": m["name"][:18],
            "score": round(float(metric_val) * 100, 1) if float(metric_val) <= 1.0 else round(float(metric_val), 1),
            "type": m["type"]
        })

    return {
        "total_datasets": total_datasets,
        "total_experiments": total_experiments,
        "total_models": total_models,
        "total_predictions": total_predictions,
        "total_reports": total_reports,
        "activity_timeline": activity_timeline,
        "quality_overview": quality_overview,
        "model_performance_overview": model_performance_overview,
        "recent_experiments": recent_exp_list,
        "recent_datasets": recent_ds_list,
        "best_models": best_models_list
    }
