# NexaDS: An Extensible AI Agent for Automated Data Science and Predictive Analytics

> **Final Year Engineering Major Project**
> A complete, fully functional, production-ready Automated Data Science (AutoML) and Predictive Analytics web application.

---

## 🌟 Overview

**NexaDS** is an end-to-end automated machine learning platform designed to streamline the entire data science lifecycle without writing boilerplate code. From raw CSV dataset ingestion and data hygiene auditing to automated pipeline training, hyperparameter tuning, model error analysis, Explainable AI (XAI), and PDF engineering audits, NexaDS provides an academic- and industry-grade platform.

---

## 🧭 The 13 Exact Navigation Modules

NexaDS strictly implements the 13 navigation modules in this sequence:

1. **CSV Dataset Upload**: Tabular CSV file ingestion (drag-and-drop), schema inference, data dimension detection, column profiling (numerical vs categorical), sample value extraction, and built-in synthetic benchmark loaders (Customer Churn, Housing Prices, Quality Stress).
2. **Dataset Mistakes Detection**: Mathematical data hygiene inspection: missing values ratio, duplicate records, IQR outlier detection and bounds, zero-variance (constant) features, type discrepancies, actionable remediation advice, and real calculated **Data Quality Score (0–100)**.
3. **Data Preprocessing**: Scikit-learn feature transformers: Mean/Median/Mode imputation or row deletion, exact deduplication, One-Hot / Label encoding, StandardScaler / MinMaxScaler normalization, IQR fence capping / trimming, before-vs-after comparison cards, and execution audit logs.
4. **Automatic ML Model Training**: Automated identification of Classification vs Regression. Trains candidate algorithms:
   - *Classification*: Logistic Regression, Decision Tree Classifier, Random Forest Classifier, Support Vector Machine (SVC), K-Nearest Neighbors (KNN), Gradient Boosting Classifier.
   - *Regression*: Linear Regression, Decision Tree Regressor, Random Forest Regressor, Gradient Boosting Regressor.
   - Models are serialized with full preprocessing pipelines using `joblib` and evaluated on holdout test partitions.
5. **Model Error Analysis**: Deep diagnostic testing: Confusion Matrix with class-wise True Positives, False Positives, False Negatives, and recall metrics; regression residual scatter, mean bias, error variance, model weaknesses, and actionable diagnostic guidance.
6. **Model Improvement & Retraining**: Hyperparameter optimization via cross-validated `GridSearchCV`, class-imbalance weighting (`class_weight="balanced"`), K-Fold cross-validation, and automated persistence into `saved_models/improved/`.
7. **Before vs After Performance Comparison**: Side-by-side benchmarking of baseline vs improved models across Accuracy, Precision, Recall, F1 Score (Classification) or MAE, MSE, RMSE, R² (Regression), delta metrics, percentage change, and interactive Recharts visualizations.
8. **Prediction Engine**: Real-time single inference using dynamic forms generated from trained feature schemas with class probabilities, plus batch CSV upload scoring with downloadable annotated CSV exports.
9. **Explainable AI (XAI)**: Model-agnostic Permutation Feature Importance measuring test set sensitivity, feature ranking tables, and individual sample waterfall attribution.
10. **Database Storage**: SQLAlchemy ORM with relational mapping across datasets, quality diagnoses, preprocessing logs, experiments, trained models, predictions, and report records. Automatic SQLite fallback (`sqlite:///./nexads.db`).
11. **Analysis History**: Audit log of past experiments with timestamp, problem type, target feature, best model, status, and abilities to reopen past sessions or delete records.
12. **PDF Report Generation**: Comprehensive 14-section ReportLab PDF generator compiling all findings, tables, error diagnoses, and XAI findings into a downloadable engineering document.
13. **Executive Dashboard**: Final command center with real-time KPI metrics, activity timeline, model score distributions, and dataset health overviews.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Vite.
- **Backend API**: Python 3.10+, FastAPI, Pydantic v2, Uvicorn.
- **Full-Stack Orchestration**: Node.js Express server (`server.ts`) proxying `/api` to FastAPI on port 8000 and serving Vite on port 3000.
- **Machine Learning**: Scikit-Learn, Pandas, NumPy, SciPy, Joblib.
- **PDF Generation**: ReportLab.
- **Database**: PostgreSQL with automatic persistent SQLite fallback via SQLAlchemy ORM.
- **Testing**: Pytest, FastAPI TestClient.

---

## 💻 Windows 10 & Windows 11 Execution Guide

NexaDS is built to run on local Windows workstations without requiring paid subscriptions or cloud configurations.

### Prerequisites

1. **Python 3.10 or higher**: [Download from python.org](https://www.python.org/downloads/) (Make sure to check *"Add python.exe to PATH"* during installation).
2. **Node.js 18 or higher**: [Download from nodejs.org](https://nodejs.org/).

### One-Click Execution (Recommended)

Double-click `start_windows.bat` or run:
```powershell
.\start_windows.bat
```

### PowerShell Manual Execution

1. Open **PowerShell** in the project directory:
```powershell
# 1. Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install Python requirements
python -m pip install -r requirements.txt

# 3. Install Node.js frontend dependencies
npm install

# 4. Start the application
npm run dev
```

2. Open your web browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 Running Pytest Verification Suite

To run backend tests:
```bash
python3 -m pytest tests/test_backend.py -v
```
All unit and end-to-end tests verify:
- Health checks
- Sample dataset generation
- Dataset mistake audits
- Data preprocessing transformations
- AutoML training & serialization
- Error analysis matrix computation
- Hyperparameter retraining
- Single & batch prediction
- ReportLab PDF compilation
- Dashboard database aggregation
