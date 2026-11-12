import uuid
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from pathlib import Path
from backend.app.core.config import UPLOADS_DIR

def predict_single(
    model_path: str,
    feature_names: List[str],
    input_data: Dict[str, Any]
) -> Tuple[str, Any, Dict[str, float]]:
    if not Path(model_path).exists():
        raise FileNotFoundError(f"Trained model not found at path: {model_path}")

    model = joblib.load(model_path)
    prediction_id = f"pred_{uuid.uuid4().hex[:10]}"

    # Build single-row DataFrame matching training feature columns
    row_dict = {}
    for col in feature_names:
        val = input_data.get(col, None)
        # Attempt type conversions if numeric
        if val is not None and str(val).strip() != "":
            try:
                if "." in str(val):
                    val = float(val)
                else:
                    val = int(val)
            except (ValueError, TypeError):
                val = str(val)
        row_dict[col] = [val]

    df_input = pd.DataFrame(row_dict)

    # Predict
    pred_val = model.predict(df_input)[0]

    # Probabilities if available (Classification)
    probs_dict = None
    if hasattr(model, "predict_proba"):
        try:
            probabilities = model.predict_proba(df_input)[0]
            classes = model.classes_
            probs_dict = {str(c): round(float(p), 4) for c, p in zip(classes, probabilities)}
        except Exception:
            probs_dict = None

    # Sanitize pred_val
    if isinstance(pred_val, (np.floating, float)):
        clean_pred = round(float(pred_val), 4)
    elif isinstance(pred_val, (np.integer, int)):
        clean_pred = int(pred_val)
    else:
        clean_pred = str(pred_val)

    return prediction_id, clean_pred, probs_dict

def predict_batch(
    model_path: str,
    feature_names: List[str],
    file_bytes: bytes
) -> Tuple[int, List[Any], str]:
    model = joblib.load(model_path)
    import io
    batch_df = pd.read_csv(io.BytesIO(file_bytes))

    # Match available features
    matched_features = [c for c in feature_names if c in batch_df.columns]
    if len(matched_features) == 0:
        raise ValueError("Uploaded CSV has no columns matching the trained model's feature set.")

    # Reindex columns to feature_names, filling missing with NaN
    aligned_df = batch_df.reindex(columns=feature_names)
    predictions = model.predict(aligned_df)

    # Attach predictions
    batch_df["nexads_prediction"] = predictions

    out_filename = f"batch_pred_{uuid.uuid4().hex[:8]}.csv"
    out_path = UPLOADS_DIR / out_filename
    batch_df.to_csv(out_path, index=False)

    sample_preds = [
        round(float(p), 4) if isinstance(p, (float, np.floating)) else str(p)
        for p in predictions[:50]
    ]

    return len(predictions), sample_preds, f"/api/datasets/download/{out_filename}"
