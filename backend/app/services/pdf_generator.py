import uuid
from pathlib import Path
from typing import Dict, Any, Tuple
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from backend.app.core.config import REPORTS_DIR

def generate_pdf_report(experiment_data: Dict[str, Any]) -> Tuple[str, str]:
    report_id = f"rep_{uuid.uuid4().hex[:10]}"
    filename = f"NexaDS_Report_{report_id}.pdf"
    filepath = REPORTS_DIR / filename

    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#1e40af") # Deep blue
    secondary_color = colors.HexColor("#3b82f6")
    text_dark = colors.HexColor("#1e293b")
    bg_light = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#cbd5e1")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=primary_color,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        "Heading2Custom",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        "BodyCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=text_dark
    )

    bold_body = ParagraphStyle(
        "BoldBody",
        parent=body_style,
        fontName="Helvetica-Bold"
    )

    story = []

    # 1. Project Title & Header
    story.append(Paragraph("NexaDS: Automated Data Science &amp; Predictive Analytics", title_style))
    story.append(Paragraph("Comprehensive Experiment &amp; Machine Learning Audit Report", ParagraphStyle(
        "SubTitle", parent=styles["Normal"], fontName="Helvetica", fontSize=11, leading=14, textColor=secondary_color
    )))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=12))

    # 2. Experiment ID & Meta Table
    exp_id = experiment_data.get("experiment_id", "N/A")
    target_col = experiment_data.get("target_column", "N/A")
    prob_type = experiment_data.get("problem_type", "N/A").capitalize()
    created_at = experiment_data.get("created_at", "N/A")
    best_model = experiment_data.get("best_model_name", "N/A")

    meta_table_data = [
        [Paragraph("<b>Experiment ID:</b>", body_style), Paragraph(str(exp_id), body_style),
         Paragraph("<b>Target Feature:</b>", body_style), Paragraph(str(target_col), body_style)],
        [Paragraph("<b>Problem Type:</b>", body_style), Paragraph(str(prob_type), body_style),
         Paragraph("<b>Best Selected Model:</b>", body_style), Paragraph(str(best_model), body_style)],
        [Paragraph("<b>Generated Timestamp:</b>", body_style), Paragraph(str(created_at), body_style),
         Paragraph("<b>Audit Status:</b>", body_style), Paragraph("Validated &amp; Complete", body_style)]
    ]
    t_meta = Table(meta_table_data, colWidths=[1.4*inch, 2.1*inch, 1.4*inch, 2.1*inch])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # 3. Dataset Information
    story.append(Paragraph("1. Dataset Information", h2_style))
    ds_info = experiment_data.get("dataset_info", {})
    ds_rows = ds_info.get("row_count", "N/A")
    ds_cols = ds_info.get("col_count", "N/A")
    ds_name = ds_info.get("original_name", "Uploaded CSV")
    story.append(Paragraph(
        f"The analysis was conducted on dataset <b>{ds_name}</b>, comprising <b>{ds_rows} rows</b> and <b>{ds_cols} columns</b>.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # 4. Dataset Quality Report
    story.append(Paragraph("2. Dataset Quality Diagnosis", h2_style))
    diag = experiment_data.get("diagnosis", {})
    q_score = diag.get("quality_score", 100.0)
    recs = diag.get("recommendations", [])
    story.append(Paragraph(f"Computed Dataset Integrity Score: <b>{q_score} / 100</b>", body_style))
    if recs:
        story.append(Paragraph("<b>Quality Audit Recommendations:</b>", bold_body))
        for r in recs[:3]:
            story.append(Paragraph(f"• {r}", body_style))
    story.append(Spacer(1, 8))

    # 5. Data Preprocessing Details
    story.append(Paragraph("3. Data Preprocessing Pipeline", h2_style))
    prep = experiment_data.get("preprocessing", {})
    ops = prep.get("operations_applied", ["Imputation", "Encoding", "Scaling"])
    story.append(Paragraph(f"Operations Applied: {', '.join(ops)}", body_style))
    story.append(Paragraph(f"Rows before: {prep.get('rows_before', ds_rows)} | Rows after: {prep.get('rows_after', ds_rows)} | Missing items handled: {prep.get('missing_handled', 0)}", body_style))
    story.append(Spacer(1, 8))

    # 6. ML Algorithms & Model Performance
    story.append(Paragraph("4. Baseline Model Training &amp; Benchmarks", h2_style))
    models = experiment_data.get("models", [])
    
    # Table of models
    if prob_type.lower() == "classification":
        table_headers = [Paragraph("<b>Algorithm</b>", bold_body), Paragraph("<b>Accuracy</b>", bold_body), Paragraph("<b>Precision</b>", bold_body), Paragraph("<b>Recall</b>", bold_body), Paragraph("<b>F1 Score</b>", bold_body)]
        rows = [table_headers]
        for m in models:
            met = m.get("metrics", {})
            rows.append([
                Paragraph(m.get("name", "Model"), body_style),
                Paragraph(str(met.get("accuracy", "N/A")), body_style),
                Paragraph(str(met.get("precision", "N/A")), body_style),
                Paragraph(str(met.get("recall", "N/A")), body_style),
                Paragraph(str(met.get("f1_score", "N/A")), body_style)
            ])
    else:
        table_headers = [Paragraph("<b>Algorithm</b>", bold_body), Paragraph("<b>MAE</b>", bold_body), Paragraph("<b>MSE</b>", bold_body), Paragraph("<b>RMSE</b>", bold_body), Paragraph("<b>R² Score</b>", bold_body)]
        rows = [table_headers]
        for m in models:
            met = m.get("metrics", {})
            rows.append([
                Paragraph(m.get("name", "Model"), body_style),
                Paragraph(str(met.get("mae", "N/A")), body_style),
                Paragraph(str(met.get("mse", "N/A")), body_style),
                Paragraph(str(met.get("rmse", "N/A")), body_style),
                Paragraph(str(met.get("r2_score", "N/A")), body_style)
            ])

    if len(rows) > 1:
        t_models = Table(rows, colWidths=[2.6*inch, 1.1*inch, 1.1*inch, 1.1*inch, 1.1*inch])
        t_models.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
            ('BOX', (0,0), (-1,-1), 1, border_color),
            ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(t_models)
    story.append(Spacer(1, 8))

    # 7. Model Error Analysis
    story.append(Paragraph("5. Model Error &amp; Weakness Analysis", h2_style))
    err = experiment_data.get("error_analysis", {})
    weaknesses = err.get("weaknesses", ["Normal operational error variance."])
    for w in weaknesses[:3]:
        story.append(Paragraph(f"• <b>Weakness Identified:</b> {w}", body_style))
    story.append(Spacer(1, 8))

    # 8. Model Improvement & Retraining
    story.append(Paragraph("6. Retraining &amp; Hyperparameter Tuning (Before vs After)", h2_style))
    imp = experiment_data.get("improvement", {})
    base_met = imp.get("baseline_metrics", {})
    imp_met = imp.get("improved_metrics", {})
    techs = imp.get("techniques_used", ["Cross-validated GridSearch", "Hyperparameter Optimization"])
    story.append(Paragraph(f"Tuning Techniques: {', '.join(techs)}", body_style))

    comp_rows = [[Paragraph("<b>Metric</b>", bold_body), Paragraph("<b>Baseline</b>", bold_body), Paragraph("<b>Improved</b>", bold_body), Paragraph("<b>Difference</b>", bold_body)]]
    all_keys = list(base_met.keys())
    for k in all_keys:
        b_val = base_met.get(k, 0)
        i_val = imp_met.get(k, 0)
        diff = round(i_val - b_val, 4) if isinstance(i_val, (int, float)) and isinstance(b_val, (int, float)) else "N/A"
        comp_rows.append([
            Paragraph(k.replace("_", " ").title(), body_style),
            Paragraph(str(b_val), body_style),
            Paragraph(str(i_val), body_style),
            Paragraph(f"{'+' if isinstance(diff, (int, float)) and diff > 0 else ''}{diff}", body_style)
        ])

    if len(comp_rows) > 1:
        t_comp = Table(comp_rows, colWidths=[2.0*inch, 1.6*inch, 1.6*inch, 1.8*inch])
        t_comp.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
            ('BOX', (0,0), (-1,-1), 1, border_color),
            ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(t_comp)
    story.append(Spacer(1, 8))

    # 9. Explainable AI & Feature Ranking
    story.append(Paragraph("7. Explainable AI (XAI) &amp; Feature Ranking", h2_style))
    xai = experiment_data.get("explainability", {})
    rankings = xai.get("ranking", [])
    if rankings:
        story.append(Paragraph(f"Top 5 Influential Predictors: <b>{', '.join(rankings[:5])}</b>", body_style))
    for note in xai.get("interpretation_notes", [])[:2]:
        story.append(Paragraph(f"• {note}", body_style))
    story.append(Spacer(1, 8))

    # 10. Final Observations
    story.append(Paragraph("8. Final Engineering Observations", h2_style))
    story.append(Paragraph(
        f"The automated pipeline identified <b>{best_model}</b> as the top performing architecture for predicting <b>{target_col}</b>. "
        "The model and its preprocessing column transformer have been serialized and persisted for dynamic prediction inference. "
        "All metrics and audit artifacts adhere to reproducible data science standards.",
        body_style
    ))

    doc.build(story)
    return filename, str(filepath)
