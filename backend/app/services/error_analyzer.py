from typing import Dict, Any, List
import numpy as np

def generate_model_error_analysis(model_info: Dict[str, Any]) -> Dict[str, Any]:
    evaluation = model_info.get("evaluation", {})
    metrics = model_info.get("metrics", {})
    model_name = model_info.get("name", "Model")
    problem_type = "classification" if "accuracy" in metrics else "regression"

    weaknesses: List[str] = []
    recommendations: List[str] = []
    classification_error = None
    regression_error = None

    if problem_type == "classification":
        cm = evaluation.get("confusion_matrix", [])
        labels = evaluation.get("labels", [])
        total_samples = evaluation.get("total_samples", 1)
        correct_predictions = evaluation.get("correct_predictions", 0)
        incorrect_predictions = evaluation.get("incorrect_predictions", 0)

        # Analyze per-class false positives and false negatives
        class_error_breakdown = []
        if len(cm) > 1 and len(labels) == len(cm):
            cm_arr = np.array(cm)
            for i, label in enumerate(labels):
                tp = int(cm_arr[i, i])
                fp = int(cm_arr[:, i].sum() - tp)
                fn = int(cm_arr[i, :].sum() - tp)
                tn = int(cm_arr.sum() - (tp + fp + fn))

                class_precision = round(tp / (tp + fp), 3) if (tp + fp) > 0 else 0.0
                class_recall = round(tp / (tp + fn), 3) if (tp + fn) > 0 else 0.0

                class_error_breakdown.append({
                    "class": label,
                    "true_positives": tp,
                    "false_positives": fp,
                    "false_negatives": fn,
                    "precision": class_precision,
                    "recall": class_recall
                })

                if class_recall < 0.6:
                    weaknesses.append(f"Class '{label}' has low recall ({round(class_recall * 100, 1)}%), missing {fn} actual instances.")
                if class_precision < 0.6:
                    weaknesses.append(f"Class '{label}' suffers from high false alarms with {fp} false positive predictions.")

        error_rate = round((incorrect_predictions / total_samples) * 100, 2) if total_samples > 0 else 0

        classification_error = {
            "confusion_matrix": cm,
            "labels": labels,
            "total_samples": total_samples,
            "correct_predictions": correct_predictions,
            "incorrect_predictions": incorrect_predictions,
            "error_rate_pct": error_rate,
            "class_breakdown": class_error_breakdown,
            "test_y_true": evaluation.get("test_y_true", []),
            "test_y_pred": evaluation.get("test_y_pred", [])
        }

        # Recommendations based on actual metrics
        if error_rate > 20:
            recommendations.append("Overall error rate exceeds 20%. Perform hyperparameter grid search and increase feature complexity.")
        if any(c["false_negatives"] > c["true_positives"] for c in class_error_breakdown):
            recommendations.append("High class imbalance detected causing severe false negatives. Apply class weighting or SMOTE resampling.")
        recommendations.append("Try non-linear ensemble models like Gradient Boosting or Random Forest to capture subtle decision boundaries.")

    else:
        # Regression
        residuals = evaluation.get("residuals", [])
        actual_vs_pred = evaluation.get("actual_vs_pred", [])
        mae = metrics.get("mae", 0.0)
        rmse = metrics.get("rmse", 0.0)
        r2 = metrics.get("r2_score", 0.0)

        # Residual distribution analysis
        mean_res = float(np.mean(residuals)) if residuals else 0.0
        std_res = float(np.std(residuals)) if residuals else 0.0

        if r2 < 0.5:
            weaknesses.append(f"Low R² score ({r2}); the model explains less than 50% of the variance in the target.")
        if abs(mean_res) > (mae * 0.25):
            weaknesses.append(f"Model exhibits systematic prediction bias (mean residual = {round(mean_res, 3)}), under/over-estimating target values.")

        # Outlier residuals
        if residuals:
            large_res_count = sum(1 for r in residuals if abs(r) > (2 * mae))
            if large_res_count > 0:
                weaknesses.append(f"{large_res_count} test predictions have residuals more than double the MAE.")

        regression_error = {
            "residuals": residuals,
            "mean_residual": round(mean_res, 4),
            "std_residual": round(std_res, 4),
            "actual_vs_pred": actual_vs_pred,
            "mae": mae,
            "rmse": rmse,
            "r2_score": r2
        }

        if r2 < 0.7:
            recommendations.append("Apply non-linear regressors (Random Forest or Gradient Boosting) or polynomial feature expansion.")
        recommendations.append("Inspect target variable distribution for extreme skewness and apply log-transformation if right-skewed.")
        recommendations.append("Tune regularization penalties and tree depth via cross-validated GridSearch.")

    if not weaknesses:
        weaknesses.append("No prominent systemic errors detected; test performance aligns with expected sample bounds.")

    return {
        "model_id": model_info.get("model_id", ""),
        "model_name": model_name,
        "problem_type": problem_type,
        "metrics": metrics,
        "classification_error": classification_error,
        "regression_error": regression_error,
        "weaknesses": weaknesses,
        "recommendations": recommendations
    }
