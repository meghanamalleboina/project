import pandas as pd
import numpy as np
from typing import Dict, Any, List

def detect_dataset_mistakes(df: pd.DataFrame) -> Dict[str, Any]:
    total_rows = len(df)
    total_cols = len(df.columns)
    total_cells = total_rows * total_cols if total_rows > 0 else 1

    # 1. Missing Values Report
    missing_by_col = {}
    total_missing_cells = 0
    for col in df.columns:
        null_cnt = int(df[col].isnull().sum())
        if null_cnt > 0:
            missing_by_col[col] = {
                "count": null_cnt,
                "percentage": round((null_cnt / total_rows) * 100, 2)
            }
            total_missing_cells += null_cnt

    missing_report = {
        "total_missing_cells": total_missing_cells,
        "missing_cell_percentage": round((total_missing_cells / total_cells) * 100, 2),
        "columns_with_missing": missing_by_col,
        "has_missing": total_missing_cells > 0
    }

    # 2. Duplicate Records Report
    duplicate_count = int(df.duplicated().sum())
    duplicate_report = {
        "count": duplicate_count,
        "percentage": round((duplicate_count / total_rows) * 100, 2) if total_rows > 0 else 0,
        "has_duplicates": duplicate_count > 0
    }

    # 3. Constant Columns (zero variance)
    constant_cols = []
    for col in df.columns:
        if df[col].nunique(dropna=False) <= 1:
            constant_cols.append(col)

    # 4. Outliers Report (IQR method on numerical columns)
    outliers_by_col = {}
    total_outliers = 0
    for col in df.select_dtypes(include=[np.number]).columns:
        series = df[col].dropna()
        if len(series) >= 4:
            q25 = float(series.quantile(0.25))
            q75 = float(series.quantile(0.75))
            iqr = q75 - q25
            lower_bound = q25 - 1.5 * iqr
            upper_bound = q75 + 1.5 * iqr
            outlier_mask = (series < lower_bound) | (series > upper_bound)
            outlier_cnt = int(outlier_mask.sum())
            if outlier_cnt > 0:
                outliers_by_col[col] = {
                    "count": outlier_cnt,
                    "percentage": round((outlier_cnt / len(series)) * 100, 2),
                    "lower_bound": round(lower_bound, 3),
                    "upper_bound": round(upper_bound, 3),
                    "min": round(float(series.min()), 3),
                    "max": round(float(series.max()), 3)
                }
                total_outliers += outlier_cnt

    outliers_report = {
        "total_outliers_detected": total_outliers,
        "columns_with_outliers": outliers_by_col,
        "has_outliers": total_outliers > 0
    }

    # 5. Data Types Diagnosis
    dtypes_report = {}
    type_mismatches = []
    for col in df.columns:
        series = df[col]
        dtype_str = str(series.dtype)
        # Check if object column actually contains convertible numbers
        if series.dtype == "object":
            non_null = series.dropna().astype(str).str.strip()
            # Try converting to numeric
            converted = pd.to_numeric(non_null, errors="coerce")
            valid_num_pct = (converted.notnull().sum() / len(non_null)) if len(non_null) > 0 else 0
            if valid_num_pct > 0.85:
                type_mismatches.append({
                    "column": col,
                    "current_dtype": "object/string",
                    "suggested_dtype": "numerical (float/int)",
                    "reason": f"{round(valid_num_pct * 100, 1)}% of values are parseable numbers with mixed formatting"
                })

        dtypes_report[col] = {
            "dtype": dtype_str,
            "unique_values": int(series.nunique()),
            "type_category": "numerical" if pd.api.types.is_numeric_dtype(series) else "categorical"
        }

    # 6. Column-wise Quality Analysis
    column_analysis = []
    for col in df.columns:
        s = df[col]
        null_cnt = int(s.isnull().sum())
        is_num = bool(pd.api.types.is_numeric_dtype(s))
        col_outliers = outliers_by_col.get(col, {}).get("count", 0)

        # Calculate a column quality score based on actual penalties
        col_penalty = 0
        if total_rows > 0:
            col_penalty += (null_cnt / total_rows) * 45 # missing penalty
        if is_num and len(s.dropna()) > 0:
            col_penalty += (col_outliers / len(s.dropna())) * 25 # outlier penalty
        if s.nunique(dropna=False) <= 1:
            col_penalty += 30 # zero variance penalty

        col_score = max(5.0, round(100.0 - col_penalty, 1))

        status = "healthy"
        if col_score < 60:
            status = "critical"
        elif col_score < 80:
            status = "warning"

        column_analysis.append({
            "column": col,
            "quality_score": col_score,
            "status": status,
            "missing_count": null_cnt,
            "unique_count": int(s.nunique()),
            "outliers_count": col_outliers,
            "is_constant": col in constant_cols
        })

    # 7. Overall Calculated Dataset Quality Score
    # Penalty-based calculation from actual metrics:
    # - missing cells penalty (up to 35 pts)
    # - duplicate rows penalty (up to 25 pts)
    # - constant columns penalty (10 pts per col, up to 20 pts)
    # - outlier severity penalty (up to 20 pts)
    missing_ratio = total_missing_cells / total_cells if total_cells > 0 else 0
    duplicate_ratio = duplicate_count / total_rows if total_rows > 0 else 0
    constant_penalty = min(20.0, len(constant_cols) * 10.0)
    outlier_ratio = (total_outliers / total_cells) if total_cells > 0 else 0

    total_penalty = (missing_ratio * 35.0) + (duplicate_ratio * 25.0) + constant_penalty + min(20.0, outlier_ratio * 100.0)
    dataset_quality_score = max(10.0, min(100.0, round(100.0 - total_penalty, 1)))

    # 8. Actionable Recommendations
    recommendations = []
    if total_missing_cells > 0:
        high_missing_cols = [c for c, v in missing_by_col.items() if v["percentage"] > 40]
        if high_missing_cols:
            recommendations.append(f"Columns {high_missing_cols} exceed 40% missing values; consider dropping them or applying specialized imputation.")
        else:
            recommendations.append(f"Handle {total_missing_cells} missing values using mean/median imputation for numerical columns and mode for categorical.")

    if duplicate_count > 0:
        recommendations.append(f"Remove {duplicate_count} duplicate row(s) in Data Preprocessing to eliminate bias and data leakage.")

    if constant_cols:
        recommendations.append(f"Drop zero-variance constant column(s): {constant_cols} as they provide zero predictive signal.")

    if total_outliers > 0:
        recommendations.append(f"Detected {total_outliers} numerical outlier values across {len(outliers_by_col)} column(s). Apply IQR capping/clipping to stabilize linear & distance models.")

    for m in type_mismatches:
        recommendations.append(f"Column '{m['column']}' has string formatting but {m['reason']}; standardize type to numeric.")

    if not recommendations:
        recommendations.append("Dataset has high integrity with no significant missing values, zero duplicates, and well-distributed features.")

    return {
        "quality_score": dataset_quality_score,
        "missing_report": missing_report,
        "duplicate_report": duplicate_report,
        "dtypes_report": {
            "columns": dtypes_report,
            "type_mismatches": type_mismatches
        },
        "outliers_report": outliers_report,
        "constant_cols": constant_cols,
        "column_analysis": column_analysis,
        "recommendations": recommendations
    }
