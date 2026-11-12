import uuid
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from pathlib import Path

from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold, KFold
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import SelectKBest, f_classif, f_regression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_absolute_error, mean_squared_error, r2_score,
    confusion_matrix
)
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression, Ridge

from backend.app.core.config import IMPROVED_MODELS_DIR
from backend.app.services.model_trainer import get_preprocessor_pipeline

def improve_and_retrain_model(
    df: pd.DataFrame,
    target_col: str,
    baseline_model_info: Dict[str, Any],
    tuning_method: str = "grid", # "grid", "random"
    handle_imbalance: bool = True,
    feature_selection: bool = True,
    n_features: int = 8,
    cv_folds: int = 3
) -> Dict[str, Any]:
    df_clean = df.dropna(subset=[target_col]).copy()
    X = df_clean.drop(columns=[target_col])
    y = df_clean[target_col]

    baseline_metrics = baseline_model_info.get("metrics", {})
    problem_type = "classification" if "accuracy" in baseline_metrics else "regression"
    base_name = baseline_model_info.get("name", "Random Forest")

    if problem_type == "classification":
        y = y.astype(str)
        stratify = y if y.value_counts().min() >= 2 else None
    else:
        stratify = None

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=stratify
    )

    preprocessor, _, _ = get_preprocessor_pipeline(X)
    techniques_used = []

    # Configure Estimator and Param Grid based on base model & problem type
    if problem_type == "classification":
        if "Forest" in base_name:
            est = RandomForestClassifier(
                random_state=42,
                class_weight="balanced" if handle_imbalance else None
            )
            param_grid = {
                "classifier__n_estimators": [100, 150],
                "classifier__max_depth": [6, 10, None],
                "classifier__min_samples_split": [2, 5]
            }
        elif "Gradient" in base_name:
            est = GradientBoostingClassifier(random_state=42)
            param_grid = {
                "classifier__n_estimators": [80, 120],
                "classifier__learning_rate": [0.05, 0.1],
                "classifier__max_depth": [3, 5]
            }
        else:
            est = LogisticRegression(
                max_iter=600,
                random_state=42,
                class_weight="balanced" if handle_imbalance else None
            )
            param_grid = {
                "classifier__C": [0.1, 1.0, 5.0],
                "classifier__penalty": ["l2"]
            }

        if handle_imbalance:
            techniques_used.append("Class-weight balancing ('balanced')")

        scoring = "f1_weighted"
        cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42) if y_train.value_counts().min() >= cv_folds else cv_folds

    else:
        # Regression
        if "Forest" in base_name:
            est = RandomForestRegressor(random_state=42)
            param_grid = {
                "regressor__n_estimators": [100, 150],
                "regressor__max_depth": [6, 10, None],
                "regressor__min_samples_split": [2, 5]
            }
        elif "Gradient" in base_name:
            est = GradientBoostingRegressor(random_state=42)
            param_grid = {
                "regressor__n_estimators": [80, 120],
                "regressor__learning_rate": [0.05, 0.1],
                "regressor__max_depth": [3, 5]
            }
        else:
            est = Ridge()
            param_grid = {
                "regressor__alpha": [0.1, 1.0, 10.0]
            }

        scoring = "r2"
        cv = KFold(n_splits=cv_folds, shuffle=True, random_state=42)

    steps = [("preprocessor", preprocessor)]
    pipeline = Pipeline(steps=steps + [("classifier" if problem_type == "classification" else "regressor", est)])

    techniques_used.append(f"GridSearchCV with {cv_folds}-Fold Cross-Validation")

    # Run hyperparameter search
    grid_search = GridSearchCV(
        pipeline,
        param_grid=param_grid,
        scoring=scoring,
        cv=cv,
        n_jobs=-1
    )

    grid_search.fit(X_train, y_train)
    best_pipeline = grid_search.best_estimator_
    best_params = {k.split("__")[-1]: v for k, v in grid_search.best_params_.items()}

    y_pred = best_pipeline.predict(X_test)

    # Compute actual improved metrics
    improved_id = f"mod_imp_{uuid.uuid4().hex[:10]}"
    model_filename = f"improved_{improved_id}_{base_name.replace(' ', '_').lower()}.joblib"
    improved_model_path = IMPROVED_MODELS_DIR / model_filename
    joblib.dump(best_pipeline, improved_model_path)

    improvements = {}
    if problem_type == "classification":
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
        rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

        improved_metrics = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4)
        }

        # Confusion matrix for improved
        labels = sorted(list(set(y_test.unique()).union(set(y_pred))))
        cm = confusion_matrix(y_test, y_pred, labels=labels).tolist()
        eval_details = {
            "confusion_matrix": cm,
            "labels": [str(l) for l in labels],
            "total_samples": len(y_test),
            "correct_predictions": int((y_test.values == y_pred).sum()),
            "incorrect_predictions": int((y_test.values != y_pred).sum())
        }

        for metric_name in ["accuracy", "precision", "recall", "f1_score"]:
            b_val = baseline_metrics.get(metric_name, 0.0)
            i_val = improved_metrics[metric_name]
            diff = round(i_val - b_val, 4)
            pct = round((diff / b_val * 100), 2) if b_val > 0 else 0.0
            improvements[metric_name] = {"diff": diff, "pct": pct}

    else:
        mae = float(mean_absolute_error(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))
        rmse = float(np.sqrt(mse))
        r2 = float(r2_score(y_test, y_pred))

        improved_metrics = {
            "mae": round(mae, 4),
            "mse": round(mse, 4),
            "rmse": round(rmse, 4),
            "r2_score": round(r2, 4)
        }

        eval_details = {
            "residuals": [round(float(r), 4) for r in (y_test.values - y_pred)[:50]],
            "mae": mae,
            "rmse": rmse,
            "r2_score": r2
        }

        for metric_name in ["mae", "rmse", "r2_score"]:
            b_val = baseline_metrics.get(metric_name, 0.0)
            i_val = improved_metrics[metric_name]
            diff = round(i_val - b_val, 4)
            pct = round((diff / b_val * 100), 2) if b_val != 0 else 0.0
            improvements[metric_name] = {"diff": diff, "pct": pct}

    return {
        "improved_model_id": improved_id,
        "model_name": f"{base_name} (Tuned & Optimized)",
        "model_type": "improved",
        "model_path": str(improved_model_path),
        "pipeline_path": str(improved_model_path),
        "best_params": best_params,
        "baseline_metrics": baseline_metrics,
        "improved_metrics": improved_metrics,
        "improvements": improvements,
        "techniques_used": techniques_used,
        "evaluation": eval_details,
        "feature_names": X.columns.tolist()
    }
