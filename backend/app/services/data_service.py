import os
import uuid
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from pathlib import Path
from backend.app.core.config import UPLOADS_DIR, SAMPLES_DIR

def save_uploaded_csv(file_bytes: bytes, original_filename: str) -> Tuple[str, str, pd.DataFrame]:
    dataset_id = f"ds_{uuid.uuid4().hex[:10]}"
    clean_name = "".join(c for c in original_filename if c.isalnum() or c in "._- ")
    filename = f"{dataset_id}_{clean_name}"
    filepath = UPLOADS_DIR / filename

    with open(filepath, "wb") as f:
        f.write(file_bytes)

    df = pd.read_csv(filepath)
    return dataset_id, str(filepath), df

def get_dataset_metadata(df: pd.DataFrame) -> Tuple[int, int, List[Dict[str, Any]], List[Dict[str, Any]]]:
    row_count = int(df.shape[0])
    col_count = int(df.shape[1])
    columns_meta = []

    for col in df.columns:
        series = df[col]
        is_num = bool(pd.api.types.is_numeric_dtype(series))
        null_count = int(series.isnull().sum())
        unique_count = int(series.nunique(dropna=False))

        # Sample values sanitized for JSON
        sample_vals = []
        for val in series.dropna().head(5):
            if isinstance(val, (np.integer, int)):
                sample_vals.append(int(val))
            elif isinstance(val, (np.floating, float)):
                sample_vals.append(round(float(val), 4))
            else:
                sample_vals.append(str(val))

        columns_meta.append({
            "name": str(col),
            "dtype": str(series.dtype),
            "is_numerical": is_num,
            "is_categorical": not is_num or (unique_count < 10 and is_num and unique_count > 1),
            "null_count": null_count,
            "unique_count": unique_count,
            "sample_values": sample_vals
        })

    # Preview head sanitized
    preview_df = df.head(10).replace({np.nan: None})
    preview = []
    for _, row in preview_df.iterrows():
        clean_row = {}
        for col in df.columns:
            val = row[col]
            if val is None or pd.isna(val):
                clean_row[str(col)] = None
            elif isinstance(val, (np.integer, int)):
                clean_row[str(col)] = int(val)
            elif isinstance(val, (np.floating, float)):
                clean_row[str(col)] = round(float(val), 4)
            else:
                clean_row[str(col)] = str(val)
        preview.append(clean_row)

    return row_count, col_count, columns_meta, preview

def generate_synthetic_samples():
    """Generates synthetic test datasets specified in Section 8."""
    np.random.seed(42)

    # 1. Classification: Customer Churn
    n = 250
    churn_df = pd.DataFrame({
        "account_length": np.random.randint(1, 100, n),
        "monthly_charges": np.random.uniform(20.0, 120.0, n).round(2),
        "total_charges": np.random.uniform(100.0, 8000.0, n).round(2),
        "contract_type": np.random.choice(["Month-to-month", "One year", "Two year"], n),
        "internet_service": np.random.choice(["DSL", "Fiber optic", "No"], n),
        "support_tickets": np.random.poisson(1.5, n),
        "churn": np.random.choice(["Yes", "No"], n, p=[0.35, 0.65])
    })
    churn_path = SAMPLES_DIR / "sample_churn_classification.csv"
    churn_df.to_csv(churn_path, index=False)

    # 2. Regression: Housing Prices
    n = 300
    sqft = np.random.randint(600, 4500, n)
    bedrooms = np.random.randint(1, 6, n)
    bathrooms = np.random.choice([1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0], n)
    age = np.random.randint(0, 50, n)
    neighborhood = np.random.choice(["Downtown", "Suburbs", "Waterfront", "Rural"], n)
    price = 100000 + (sqft * 180) + (bedrooms * 15000) + (bathrooms * 20000) - (age * 1200) + np.random.normal(0, 25000, n)

    house_df = pd.DataFrame({
        "sqft": sqft,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "property_age": age,
        "neighborhood": neighborhood,
        "sale_price": np.maximum(50000, price).round(2)
    })
    house_path = SAMPLES_DIR / "sample_housing_regression.csv"
    house_df.to_csv(house_path, index=False)

    # 3. Quality Stress Dataset: Missing, Duplicates, Outliers, Constant
    n = 200
    age_col = np.random.normal(35, 10, n)
    age_col[0] = 190 # extreme outlier
    age_col[1] = 220 # extreme outlier

    income_col = np.random.normal(60000, 15000, n)
    income_col[2] = 950000 # extreme outlier

    dept_col = np.random.choice(["Sales", "Engineering", "HR", "Marketing"], n)

    stress_df = pd.DataFrame({
        "employee_id": range(1001, 1001 + n),
        "age": age_col.round(1),
        "annual_income": income_col.round(2),
        "department": dept_col,
        "constant_feature": ["HQ-North"] * n, # Constant column
        "performance_score": np.random.choice([1, 2, 3, 4, 5], n)
    })

    # Add deliberate missing values
    stress_df.loc[5:15, "annual_income"] = np.nan
    stress_df.loc[20:25, "department"] = np.nan

    # Add deliberate duplicate records
    dup_rows = stress_df.iloc[0:5].copy()
    stress_df = pd.concat([stress_df, dup_rows], ignore_index=True)

    stress_path = SAMPLES_DIR / "sample_data_quality_stress.csv"
    stress_df.to_csv(stress_path, index=False)

    return {
        "churn": str(churn_path),
        "housing": str(house_path),
        "quality_stress": str(stress_path)
    }
