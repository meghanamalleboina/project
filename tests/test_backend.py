import io
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_load_sample_dataset_churn():
    response = client.post("/api/datasets/samples/load", data={"sample_type": "churn"})
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["row_count"] > 0
    assert data["col_count"] > 0
    assert len(data["columns_meta"]) > 0

def test_dataset_mistakes_detection():
    # Load quality stress sample
    load_resp = client.post("/api/datasets/samples/load", data={"sample_type": "quality_stress"})
    assert load_resp.status_code == 200
    dataset_id = load_resp.json()["id"]

    # Test mistakes detection
    diag_resp = client.get(f"/api/datasets/{dataset_id}/mistakes")
    assert diag_resp.status_code == 200
    diag = diag_resp.json()
    assert "quality_score" in diag
    assert diag["missing_report"]["has_missing"] is True
    assert diag["duplicate_report"]["has_duplicates"] is True
    assert len(diag["constant_cols"]) > 0
    assert len(diag["recommendations"]) > 0

def test_data_preprocessing_pipeline():
    load_resp = client.post("/api/datasets/samples/load", data={"sample_type": "quality_stress"})
    dataset_id = load_resp.json()["id"]

    prep_req = {
        "dataset_id": dataset_id,
        "handle_missing": True,
        "missing_strategy": "mean",
        "remove_duplicates": True,
        "encoding": "one_hot",
        "scaling": "standard",
        "outlier_treatment": "iqr_clip"
    }
    prep_resp = client.post("/api/preprocessing/run", json=prep_req)
    assert prep_resp.status_code == 200
    data = prep_resp.json()
    assert "processed_dataset_id" in data
    assert data["rows_after"] <= data["rows_before"]
    assert len(data["operations_applied"]) >= 3

def test_end_to_end_ml_training_and_evaluation():
    # 1. Load Churn classification sample
    load_resp = client.post("/api/datasets/samples/load", data={"sample_type": "churn"})
    dataset_id = load_resp.json()["id"]

    # 2. Train baseline models
    train_req = {
        "dataset_id": dataset_id,
        "target_column": "churn",
        "problem_type": "classification",
        "test_size": 0.2
    }
    train_resp = client.post("/api/training/train", json=train_req)
    assert train_resp.status_code == 200
    train_data = train_resp.json()
    assert "experiment_id" in train_data
    assert len(train_data["models"]) >= 4
    experiment_id = train_data["experiment_id"]
    best_model = next(m for m in train_data["models"] if m["is_best"])
    model_id = best_model["model_id"]

    # 3. Model Error Analysis
    err_resp = client.get(f"/api/evaluation/errors/{model_id}")
    assert err_resp.status_code == 200
    err_data = err_resp.json()
    assert err_data["classification_error"] is not None
    assert len(err_data["weaknesses"]) > 0

    # 4. Model Improvement & Retraining
    improve_req = {
        "experiment_id": experiment_id,
        "model_id": model_id,
        "tuning_method": "grid",
        "handle_imbalance": True,
        "cv_folds": 2
    }
    imp_resp = client.post("/api/training/improve", json=improve_req)
    assert imp_resp.status_code == 200
    imp_data = imp_resp.json()
    assert "improved_model_id" in imp_data
    assert "improved_metrics" in imp_data

    # 5. Before vs After Comparison
    comp_resp = client.get(f"/api/evaluation/compare/{experiment_id}")
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()
    assert len(comp_data["comparison"]) > 0

    # 6. Single Prediction
    pred_req = {
        "model_id": model_id,
        "input_data": {
            "account_length": 35,
            "monthly_charges": 65.5,
            "total_charges": 2200.0,
            "contract_type": "Month-to-month",
            "internet_service": "Fiber optic",
            "support_tickets": 2
        }
    }
    pred_resp = client.post("/api/prediction/single", json=pred_req)
    assert pred_resp.status_code == 200
    pred_data = pred_resp.json()
    assert "prediction" in pred_data

    # 7. Explainable AI
    explain_resp = client.post(f"/api/explainability/{model_id}", json={"model_id": model_id})
    assert explain_resp.status_code == 200
    xai_data = explain_resp.json()
    assert len(xai_data["feature_importance"]) > 0

    # 8. PDF Report Generation
    rep_resp = client.post(f"/api/reports/generate/{experiment_id}")
    assert rep_resp.status_code == 200
    rep_data = rep_resp.json()
    assert "download_url" in rep_data

    # 9. Dashboard Stats
    dash_resp = client.get("/api/dashboard/stats")
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert dash_data["total_datasets"] >= 1
    assert dash_data["total_experiments"] >= 1
