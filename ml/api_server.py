
import sys
import os
import io
from pathlib import Path
from typing import Optional

os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from flask import Flask, jsonify, request
from flask_cors import CORS

import predict_CORRECTED as ml

app = Flask(__name__)
CORS(app)

print("Pre-computing controlled ML degradation curves (laps 1-40)...")
summary_df, curves_df = ml.degradation_summary(age_min=1, age_max=40)
SUMMARY_CACHE = summary_df.to_dict(orient="records")
CURVES_CACHE = curves_df.to_dict(orient="records")
print("[OK] ML Model Cache Ready!")


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "online",
        "models_loaded": {
            "lightgbm": True,
            "xgboost_corrected": True,
            "catboost": True,
        },
        "features_count": len(ml.FEATURES),
    })


@app.get("/api/degradation/summary")
def get_degradation_summary():
    """Returns degradation summary metrics for HARD, MEDIUM, and SOFT compounds."""
    return jsonify({"status": "success", "summary": SUMMARY_CACHE})


@app.get("/api/degradation/curves")
def get_degradation_curves():
    """Returns detailed degradation curves across LightGBM, XGBoost, CatBoost, and Ensemble."""
    compound = request.args.get("compound")
    if compound:
        compound_upper = compound.upper()
        filtered = [c for c in CURVES_CACHE if c.get("compound") == compound_upper]
        return jsonify({"status": "success", "compound": compound_upper, "curves": filtered})
    return jsonify({"status": "success", "curves": CURVES_CACHE})


@app.get("/api/degradation/predict")
def predict_single_lap():
    """Runs live inference for a single tyre compound and age."""
    compound = request.args.get("compound", "MEDIUM").upper()
    age_param = request.args.get("tyre_age") or request.args.get("age") or "1"
    try:
        age = int(age_param)
    except ValueError:
        age = 1
    result = ml.predict_tyre(compound, age)
    return jsonify({"status": "success", "prediction": result})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000)