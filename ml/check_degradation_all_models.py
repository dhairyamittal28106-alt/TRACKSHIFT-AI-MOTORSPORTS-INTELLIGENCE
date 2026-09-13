import os
import sys
import io
from pathlib import Path
import numpy as np
import pandas as pd

os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import predict_CORRECTED as ml

def run_diagnostic():
    compounds = ["SOFT", "MEDIUM", "HARD"]
    age_min = 1
    age_max = 40

    all_curves = []
    summary_rows = []

    for compound in compounds:
        results = []
        base_df = ml.build_reference(compound)

        for age in range(age_min, age_max + 1):
            X = base_df.copy()
            if "TyreAge" in X.columns:
                X.loc[0, "TyreAge"] = float(age)
            if "TyreAge_sq" in X.columns:
                X.loc[0, "TyreAge_sq"] = float(age) ** 2
            if "TyreAge_cb" in X.columns:
                X.loc[0, "TyreAge_cb"] = float(age) ** 3
            if "FreshTyre" in X.columns:
                X.loc[0, "FreshTyre"] = 1.0
            X.loc[0, "Compound"] = compound

            pred_lgb, pred_xgb, pred_cat, ensemble = ml.predict_models(X)

            results.append({
                "compound": compound,
                "tyre_age": age,
                "lightgbm_s": pred_lgb,
                "xgboost_s": pred_xgb,
                "catboost_s": pred_cat,
                "ensemble_s": ensemble,
            })

        cdf = pd.DataFrame(results)

        lgb_base = cdf.loc[cdf["tyre_age"] == 1, "lightgbm_s"].values[0]
        xgb_base = cdf.loc[cdf["tyre_age"] == 1, "xgboost_s"].values[0]
        cat_base = cdf.loc[cdf["tyre_age"] == 1, "catboost_s"].values[0]
        ens_base = cdf.loc[cdf["tyre_age"] == 1, "ensemble_s"].values[0]

        cdf["lightgbm_deg_s"] = cdf["lightgbm_s"] - lgb_base
        cdf["xgboost_deg_s"] = cdf["xgboost_s"] - xgb_base
        cdf["catboost_deg_s"] = cdf["catboost_s"] - cat_base
        cdf["ensemble_deg_s"] = cdf["ensemble_s"] - ens_base

        all_curves.append(cdf)

        x = cdf["tyre_age"].values.astype(float)
        
        slope_lgb = np.polyfit(x, cdf["lightgbm_s"].values.astype(float), 1)[0]
        slope_xgb = np.polyfit(x, cdf["xgboost_s"].values.astype(float), 1)[0]
        slope_cat = np.polyfit(x, cdf["catboost_s"].values.astype(float), 1)[0]
        slope_ens = np.polyfit(x, cdf["ensemble_s"].values.astype(float), 1)[0]

        age10_lgb = cdf.loc[cdf["tyre_age"] == 10, "lightgbm_deg_s"].values[0]
        age10_xgb = cdf.loc[cdf["tyre_age"] == 10, "xgboost_deg_s"].values[0]
        age10_cat = cdf.loc[cdf["tyre_age"] == 10, "catboost_deg_s"].values[0]
        age10_ens = cdf.loc[cdf["tyre_age"] == 10, "ensemble_deg_s"].values[0]

        age20_lgb = cdf.loc[cdf["tyre_age"] == 20, "lightgbm_deg_s"].values[0]
        age20_xgb = cdf.loc[cdf["tyre_age"] == 20, "xgboost_deg_s"].values[0]
        age20_cat = cdf.loc[cdf["tyre_age"] == 20, "catboost_deg_s"].values[0]
        age20_ens = cdf.loc[cdf["tyre_age"] == 20, "ensemble_deg_s"].values[0]

        age40_lgb = cdf.loc[cdf["tyre_age"] == 40, "lightgbm_deg_s"].values[0]
        age40_xgb = cdf.loc[cdf["tyre_age"] == 40, "xgboost_deg_s"].values[0]
        age40_cat = cdf.loc[cdf["tyre_age"] == 40, "catboost_deg_s"].values[0]
        age40_ens = cdf.loc[cdf["tyre_age"] == 40, "ensemble_deg_s"].values[0]

        summary_rows.extend([
            {
                "compound": compound,
                "model": "LightGBM",
                "linear_slope_s_per_lap": slope_lgb,
                "pace_loss_age1_to_10_s": age10_lgb,
                "pace_loss_age1_to_20_s": age20_lgb,
                "pace_loss_age1_to_40_s": age40_lgb,
                "starting_pace_age1_s": lgb_base,
                "ending_pace_age40_s": cdf.loc[cdf["tyre_age"] == 40, "lightgbm_s"].values[0]
            },
            {
                "compound": compound,
                "model": "XGBoost",
                "linear_slope_s_per_lap": slope_xgb,
                "pace_loss_age1_to_10_s": age10_xgb,
                "pace_loss_age1_to_20_s": age20_xgb,
                "pace_loss_age1_to_40_s": age40_xgb,
                "starting_pace_age1_s": xgb_base,
                "ending_pace_age40_s": cdf.loc[cdf["tyre_age"] == 40, "xgboost_s"].values[0]
            },
            {
                "compound": compound,
                "model": "CatBoost",
                "linear_slope_s_per_lap": slope_cat,
                "pace_loss_age1_to_10_s": age10_cat,
                "pace_loss_age1_to_20_s": age20_cat,
                "pace_loss_age1_to_40_s": age40_cat,
                "starting_pace_age1_s": cat_base,
                "ending_pace_age40_s": cdf.loc[cdf["tyre_age"] == 40, "catboost_s"].values[0]
            },
            {
                "compound": compound,
                "model": "Ensemble",
                "linear_slope_s_per_lap": slope_ens,
                "pace_loss_age1_to_10_s": age10_ens,
                "pace_loss_age1_to_20_s": age20_ens,
                "pace_loss_age1_to_40_s": age40_ens,
                "starting_pace_age1_s": ens_base,
                "ending_pace_age40_s": cdf.loc[cdf["tyre_age"] == 40, "ensemble_s"].values[0]
            }
        ])

    final_curves_df = pd.concat(all_curves, ignore_index=True)
    final_summary_df = pd.DataFrame(summary_rows)

    curves_path = BASE_DIR / "DIAGNOSTIC_FIXED_FRESHTYRE_ALL_MODELS_CURVES.csv"
    summary_path = BASE_DIR / "DIAGNOSTIC_FIXED_FRESHTYRE_ALL_MODELS_SUMMARY.csv"

    final_curves_df.to_csv(curves_path, index=False)
    final_summary_df.to_csv(summary_path, index=False)

    print("\n" + "=" * 80)
    print("DIAGNOSTIC (FIXED FRESHTYRE=1.0) EVALUATION Across ALL MODELS")
    print("=" * 80 + "\n")

    for compound in compounds:
        print(f"{compound}")
        c_summary = final_summary_df[final_summary_df["compound"] == compound]
        for _, row in c_summary.iterrows():
            m = row["model"]
            slope = row["linear_slope_s_per_lap"]
            p10 = row["pace_loss_age1_to_10_s"]
            p20 = row["pace_loss_age1_to_20_s"]
            p40 = row["pace_loss_age1_to_40_s"]
            print(f"  {m:10s}: Slope={slope:+.5f} s/lap | Age1->10={p10:+.5f}s | Age1->20={p20:+.5f}s | Age1->40={p40:+.5f}s")
        print()

    print("=" * 80)
    print("COMPOUND ORDERINGS ACROSS EVALUATION METRICS")
    print("=" * 80 + "\n")

    metrics = [
        ("linear_slope_s_per_lap", "Linear Slope (s/lap)"),
        ("pace_loss_age1_to_10_s", "Age 1 -> 10 Pace Loss (s)"),
        ("pace_loss_age1_to_20_s", "Age 1 -> 20 Pace Loss (s)"),
        ("pace_loss_age1_to_40_s", "Age 1 -> 40 Pace Loss (s)"),
    ]

    for col, label in metrics:
        print(f"--- Ordering for {label} ---")
        for m in ["LightGBM", "XGBoost", "CatBoost", "Ensemble"]:
            m_df = final_summary_df[final_summary_df["model"] == m].sort_values(col, ascending=False)
            ordering = " > ".join([f"{r['compound']} ({r[col]:+.5f})" for _, r in m_df.iterrows()])
            print(f"  {m:10s}: {ordering}")
        print()

    print(f"✓ Saved {curves_path.name}")
    print(f"✓ Saved {summary_path.name}")

if __name__ == "__main__":
    run_diagnostic()
