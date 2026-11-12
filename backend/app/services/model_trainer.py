import uuid
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from pathlib import Path

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_absolute_error, mean_squared_error, r2_score,
    confusion_matrix
)

# Classification Models
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

# Regression Models
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

from backend.app.core.config import BASELINE_MODELS_DIR

def detect_problem_type(df: pd.DataFrame, target_col: str) -> str:
    series = df[target_col].dropna()
    is_num = pd.api.types.is_numeric_dtype(series)
    unique_count = series.nunique()

    # If non-numeric or small number of unique values -> classification
    if not is_num or unique_count <= 10 or (is_num and unique_count <= 20 and float(series.iloc[0]).is_integer()):
        return "classification"
    return "regression"

def get_preprocessor_pipeline(X: pd.DataFrame) -> Tuple[ColumnTransformer, List[str], List[str]]:
    numeric_features = X.select_dtypes(include=[np.number]).columns.tolist()
    categorical_features = X.select_dtypes(include=["object", "category", "bool"]).columns.tolist()

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features)
        ],
        remainder="drop"
    )

    return preprocessor, numeric_features, categorical_features

def train_baseline_models(
    df: pd.DataFrame,
    target_col: str,
    problem_type: str = "auto",
    test_size: float = 0.2
) -> Dict[str, Any]:
    logs = []
    experiment_id = f"exp_{uuid.uuid4().hex[:10]}"

    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataset.")

    # Drop rows where target is null
    df_clean = df.dropna(subset=[target_col]).copy()
    if len(df_clean) < 10:
        raise ValueError("Dataset too small after removing missing target rows (less than 10 rows).")

    if problem_type == "auto":
        problem_type = detect_problem_type(df_clean, target_col)
    logs.append(f"Identified problem type: '{problem_type.upper()}' for target '{target_col}'.")

    X = df_clean.drop(columns=[target_col])
    y = df_clean[target_col]

    # Convert y to string classes if classification
    if problem_type == "classification":
        y = y.astype(str)

    # Train / Test split
    stratify = y if (problem_type == "classification" and y.value_counts().min() >= 2) else None
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=stratify
    )
    logs.append(f"Dataset split: {len(X_train)} training samples, {len(X_test)} testing samples (test size = {int(test_size*100)}%).")

    preprocessor, num_cols, cat_cols = get_preprocessor_pipeline(X)

    # Define algorithm candidates
    if problem_type == "classification":
        algorithms = [
            ("Logistic Regression", LogisticRegression(max_iter=500, random_state=42)),
            ("Decision Tree Classifier", DecisionTreeClassifier(random_state=42, max_depth=6)),
            ("Random Forest Classifier", RandomForestClassifier(n_estimators=100, random_state=42, max_depth=8)),
            ("Support Vector Machine", SVC(probability=True, random_state=42, kernel="linear")),
            ("K-Nearest Neighbors", KNeighborsClassifier(n_neighbors=min(5, max(1, len(X_train)-1)))),
            ("Gradient Boosting Classifier", GradientBoostingClassifier(n_estimators=80, random_state=42))
        ]
    else:
        algorithms = [
            ("Linear Regression", LinearRegression()),
            ("Decision Tree Regressor", DecisionTreeRegressor(random_state=42, max_depth=6)),
            ("Random Forest Regressor", RandomForestRegressor(n_estimators=100, random_state=42, max_depth=8)),
            ("Gradient Boosting Regressor", GradientBoostingRegressor(n_estimators=80, random_state=42))
        ]

    trained_models = []
    best_score = -float("inf")
    best_model_name = ""

    for name, estimator in algorithms:
        try:
            pipe = Pipeline(steps=[
                ("preprocessor", preprocessor),
                ("classifier" if problem_type == "classification" else "regressor", estimator)
            ])

            pipe.fit(X_train, y_train)
            y_pred = pipe.predict(X_test)

            model_id = f"mod_{uuid.uuid4().hex[:10]}"
            model_filename = f"{experiment_id}_{model_id}_{name.replace(' ', '_').lower()}.joblib"
            model_path = BASELINE_MODELS_DIR / model_filename

            # Save model with joblib
            joblib.dump(pipe, model_path)

            if problem_type == "classification":
                acc = float(accuracy_score(y_test, y_pred))
                prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
                rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
                f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

                metrics = {
                    "accuracy": round(acc, 4),
                    "precision": round(prec, 4),
                    "recall": round(rec, 4),
                    "f1_score": round(f1, 4)
                }

                # Confusion Matrix
                labels = sorted(list(set(y_test.unique()).union(set(y_pred))))
                cm = confusion_matrix(y_test, y_pred, labels=labels).tolist()

                # Detailed errors
                errors_cnt = int((y_test.values != y_pred).sum())
                correct_cnt = int((y_test.values == y_pred).sum())

                eval_details = {
                    "confusion_matrix": cm,
                    "labels": [str(l) for l in labels],
                    "total_samples": len(y_test),
                    "correct_predictions": correct_cnt,
                    "incorrect_predictions": errors_cnt,
                    "test_y_true": [str(v) for v in y_test.tolist()[:50]],
                    "test_y_pred": [str(v) for v in y_pred.tolist()[:50]]
                }
                primary_score = f1

            else:
                mae = float(mean_absolute_error(y_test, y_pred))
                mse = float(mean_squared_error(y_test, y_pred))
                rmse = float(np.sqrt(mse))
                r2 = float(r2_score(y_test, y_pred))

                metrics = {
                    "mae": round(mae, 4),
                    "mse": round(mse, 4),
                    "rmse": round(rmse, 4),
                    "r2_score": round(r2, 4)
                }

                residuals = (y_test.values - y_pred).tolist()
                eval_details = {
                    "residuals": [round(float(r), 4) for r in residuals[:50]],
                    "actual_vs_pred": [
                        {"actual": round(float(a), 4), "predicted": round(float(p), 4), "residual": round(float(a - p), 4)}
                        for a, p in zip(y_test.values[:40], y_pred[:40])
                    ],
                    "total_samples": len(y_test)
                }
                primary_score = r2

            is_best = primary_score > best_score
            if is_best:
                best_score = primary_score
                best_model_name = name

            trained_models.append({
                "model_id": model_id,
                "name": name,
                "algorithm": name,
                "model_type": "baseline",
                "metrics": metrics,
                "is_best": False, # will mark final best
                "model_path": str(model_path),
                "pipeline_path": str(model_path),
                "feature_names": X.columns.tolist(),
                "evaluation": eval_details,
                "primary_score": primary_score
            })
            logs.append(f"Trained {name}: Primary metric score = {round(primary_score, 4)}.")

        except Exception as err:
            logs.append(f"Failed training {name}: {str(err)}")

    # Mark overall best model
    for m in trained_models:
        if m["name"] == best_model_name:
            m["is_best"] = True

    logs.append(f"Training completed successfully. Best baseline model: '{best_model_name}' (score: {round(best_score, 4)}).")

    return {
        "experiment_id": experiment_id,
        "problem_type": problem_type,
        "best_model_name": best_model_name,
        "models": trained_models,
        "training_logs": logs
    }
