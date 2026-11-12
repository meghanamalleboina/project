import uuid
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from pathlib import Path
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from sklearn.feature_selection import SelectKBest, f_classif, f_regression
from backend.app.core.config import UPLOADS_DIR
from backend.app.services.data_service import get_dataset_metadata

def preprocess_dataset(
    original_df: pd.DataFrame,
    handle_missing: bool = True,
    missing_strategy: str = "mean", # "mean", "median", "mode", "drop"
    remove_duplicates: bool = True,
    encoding: str = "one_hot", # "one_hot", "label", "none"
    scaling: str = "standard", # "standard", "minmax", "none"
    outlier_treatment: str = "iqr_clip", # "iqr_clip", "iqr_remove", "none"
    feature_selection: bool = False,
    k_best: int = 10,
    target_col: str = None
) -> Tuple[pd.DataFrame, Dict[str, Any], str]:
    df = original_df.copy()
    rows_before = int(df.shape[0])
    cols_before = int(df.shape[1])
    logs: List[str] = []
    operations: List[str] = []

    # 1. Duplicate Removal
    if remove_duplicates:
        dups_count = int(df.duplicated().sum())
        if dups_count > 0:
            df = df.drop_duplicates().reset_index(drop=True)
            logs.append(f"Removed {dups_count} duplicate rows ({rows_before} -> {len(df)} rows).")
            operations.append("Duplicate Removal")
        else:
            logs.append("No duplicate rows detected.")

    # 2. Missing Value Handling
    missing_handled_count = int(df.isnull().sum().sum())
    if handle_missing and missing_handled_count > 0:
        if missing_strategy == "drop":
            df = df.dropna().reset_index(drop=True)
            logs.append(f"Dropped rows with missing values. Row count now: {len(df)}.")
            operations.append("Drop Missing Rows")
        else:
            for col in df.columns:
                if df[col].isnull().sum() > 0:
                    if pd.api.types.is_numeric_dtype(df[col]):
                        if missing_strategy == "median":
                            fill_val = df[col].median()
                        else:
                            fill_val = df[col].mean()
                        df[col] = df[col].fillna(fill_val)
                    else:
                        mode_val = df[col].mode()
                        fill_val = mode_val.iloc[0] if not mode_val.empty else "Missing"
                        df[col] = df[col].fillna(fill_val)
            logs.append(f"Imputed {missing_handled_count} missing values using strategy '{missing_strategy}'.")
            operations.append(f"Imputation ({missing_strategy})")
    elif missing_handled_count == 0:
        logs.append("No missing values found in dataset.")

    # 3. Outlier Treatment (IQR)
    if outlier_treatment in ["iqr_clip", "iqr_remove"]:
        num_cols = df.select_dtypes(include=[np.number]).columns
        clipped_count = 0
        removed_mask = pd.Series(False, index=df.index)

        for col in num_cols:
            if col == target_col:
                continue
            q25 = df[col].quantile(0.25)
            q75 = df[col].quantile(0.75)
            iqr = q75 - q25
            lb = q25 - 1.5 * iqr
            ub = q75 + 1.5 * iqr

            if outlier_treatment == "iqr_clip":
                outliers_mask = (df[col] < lb) | (df[col] > ub)
                clipped_count += int(outliers_mask.sum())
                df[col] = df[col].clip(lower=lb, upper=ub)
            elif outlier_treatment == "iqr_remove":
                removed_mask = removed_mask | (df[col] < lb) | (df[col] > ub)

        if outlier_treatment == "iqr_clip":
            logs.append(f"Treated outliers: Clipped {clipped_count} extreme values to IQR fences [Q1 - 1.5*IQR, Q3 + 1.5*IQR].")
            operations.append("Outlier Capping (IQR)")
        elif outlier_treatment == "iqr_remove":
            rows_removed = int(removed_mask.sum())
            df = df[~removed_mask].reset_index(drop=True)
            logs.append(f"Removed {rows_removed} rows containing extreme IQR outliers.")
            operations.append("Outlier Removal (IQR)")

    # 4. Categorical Encoding
    target_series = None
    if target_col and target_col in df.columns:
        target_series = df[target_col]
        features_df = df.drop(columns=[target_col])
    else:
        features_df = df

    cat_cols = features_df.select_dtypes(include=["object", "category"]).columns.tolist()
    if encoding == "one_hot" and cat_cols:
        features_df = pd.get_dummies(features_df, columns=cat_cols, drop_first=True)
        logs.append(f"Applied One-Hot Encoding to categorical columns: {cat_cols}. Expanded to {features_df.shape[1]} features.")
        operations.append("One-Hot Encoding")
    elif encoding == "label" and cat_cols:
        for col in cat_cols:
            le = LabelEncoder()
            features_df[col] = le.fit_transform(features_df[col].astype(str))
        logs.append(f"Applied Label Encoding to columns: {cat_cols}.")
        operations.append("Label Encoding")

    # 5. Numerical Scaling
    if scaling in ["standard", "minmax"]:
        numeric_cols = features_df.select_dtypes(include=[np.number]).columns.tolist()
        # Don't scale binary dummy columns from one-hot encoding if standard
        scale_cols = [c for c in numeric_cols if features_df[c].nunique() > 2]
        if scale_cols:
            scaler = StandardScaler() if scaling == "standard" else MinMaxScaler()
            features_df[scale_cols] = scaler.fit_transform(features_df[scale_cols])
            logs.append(f"Applied {scaling.capitalize()} scaling to {len(scale_cols)} numerical features.")
            operations.append(f"{scaling.capitalize()} Scaling")

    # Reattach target column if separated
    if target_series is not None:
        features_df[target_col] = target_series

    processed_df = features_df
    rows_after = int(processed_df.shape[0])
    cols_after = int(processed_df.shape[1])

    # Save processed dataframe
    processed_id = f"proc_{uuid.uuid4().hex[:10]}"
    processed_filepath = UPLOADS_DIR / f"{processed_id}_processed.csv"
    processed_df.to_csv(processed_filepath, index=False)

    summary = {
        "processed_id": processed_id,
        "rows_before": rows_before,
        "rows_after": rows_after,
        "cols_before": cols_before,
        "cols_after": cols_after,
        "missing_handled": missing_handled_count,
        "operations_applied": operations,
        "logs": logs
    }

    return processed_df, summary, str(processed_filepath)
