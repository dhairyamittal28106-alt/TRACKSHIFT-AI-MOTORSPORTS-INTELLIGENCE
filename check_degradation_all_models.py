"""
TrackShift — Model Degradation Diagnostic
------------------------------------------
Checks tyre-age degradation for:
    LightGBM
    XGBoost
    CatBoost
    Ensemble

IMPORTANT:
- NO model retraining
- NO model modification
- NO frontend modification
- FreshTyre is FIXED during the entire age sweep
- SAME reference context is used for Soft / Medium / Hard
- ONLY tyre age changes
"""

import os
import glob
import warnings
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")


# ============================================================
# CONFIG
# ============================================================

DATA_FILE = "ENRICHED_TYRE_DATASET_2022_ONWARDS.csv"

# Change this only if your models are stored elsewhere
MODEL_DIR = "models"

AGES = list(range(1, 41))

COMPOUNDS = ["SOFT", "MEDIUM", "HARD"]


# ============================================================
# FIND MODEL FILES
# ============================================================

def find_model(patterns):
    for pattern in patterns:
        matches = glob.glob(
            os.path.join(MODEL_DIR, pattern),
            recursive=True
        )

        if matches:
            return matches[0]

    return None


LGB_PATH = find_model([
    "*lightgbm*.pkl",
    "*lightgbm*.joblib",
    "*lgb*.pkl",
    "*lgb*.joblib",
])

XGB_PATH = find_model([
    "*xgboost*.pkl",
    "*xgboost*.joblib",
    "*xgb*.pkl",
    "*xgb*.joblib",
])

CAT_PATH = find_model([
    "*catboost*.pkl",
    "*catboost*.joblib",
    "*cat*.pkl",
    "*cat*.joblib",
])


print("\n" + "=" * 70)
print("TRACKSHIFT — MODEL DEGRADATION DIAGNOSTIC")
print("=" * 70)

print("\nModel files found:")

print("LightGBM :", LGB_PATH)
print("XGBoost  :", XGB_PATH)
print("CatBoost :", CAT_PATH)


# ============================================================
# LOAD DATA
# ============================================================

print("\nLoading dataset...")

df = pd.read_csv(DATA_FILE)

print("Dataset shape:", df.shape)


# ============================================================
# REQUIRED FEATURES
# ============================================================

CAT_COLS = [
    "Driver",
    "Team",
    "Compound",
    "Event",
    "SessionName",
    "TrafficExposureLevel_V4",
]

NUM_COLS = [
    "TyreAge",
    "TyreAge_sq",
    "TyreAge_cb",
    "LapNumber",
    "SessionProgress",
    "AirTemp",
    "TrackTemp",
    "Humidity",
    "Pressure",
    "WindSpeed",
    "TrackStatusCode",
    "TrafficGapAhead_V4",
    "TrafficGapBehind_V4",
    "TrafficExposureScore_V4",
    "SessionPaceEvolution",
    "DriverBestSoFar",
]

BOOL_COLS = [
    "FreshTyre",
    "Rainfall",
]

FEATURES = CAT_COLS + NUM_COLS + BOOL_COLS


missing = [c for c in FEATURES if c not in df.columns]

if missing:
    print("\nERROR — Missing features:")
    print(missing)
    raise SystemExit


# ============================================================
# BUILD CAUSAL FEATURES
# ============================================================

print("\nBuilding causal features...")

df = df.copy()

if "SessionKey" not in df.columns:
    df["SessionKey"] = (
        df["Year"].astype(str)
        + "_"
        + df["Event"].astype(str)
        + "_"
        + df["SessionName"].astype(str)
    )

# Session pace evolution:
# ONLY previous laps are used.
df["SessionPaceEvolution"] = (
    df.groupby("SessionKey")["LapTimeSeconds"]
      .transform(
          lambda s: s.shift(1).expanding().median()
      )
)

# Driver best so far:
# ONLY previous laps are used.
df["DriverBestSoFar"] = (
    df.groupby(["SessionKey", "Driver"])["LapTimeSeconds"]
      .transform(
          lambda s: s.shift(1).expanding().min()
      )
)

# Global fallback
global_fallback = df["LapTimeSeconds"].median()

df["SessionPaceEvolution"] = (
    df["SessionPaceEvolution"]
    .fillna(global_fallback)
)

df["DriverBestSoFar"] = (
    df["DriverBestSoFar"]
    .fillna(global_fallback)
)


# Tyre age features
df["TyreAge_sq"] = df["TyreAge"] ** 2
df["TyreAge_cb"] = df["TyreAge"] ** 3


# ============================================================
# SELECT ONE SHARED REFERENCE CONTEXT
# ============================================================

print("\nSelecting shared reference context...")

eligible = df[
    df["Compound"].isin(COMPOUNDS)
].copy()

if len(eligible) == 0:
    raise RuntimeError("No SOFT/MEDIUM/HARD rows found.")


# Use median numerical context and mode categorical context.
# This creates ONE shared environment for all compounds.

reference = {}

for col in CAT_COLS:
    reference[col] = eligible[col].mode(dropna=True).iloc[0]

for col in NUM_COLS:
    if col == "TyreAge":
        continue

    reference[col] = pd.to_numeric(
        eligible[col],
        errors="coerce"
    ).median()

for col in BOOL_COLS:
    # IMPORTANT:
    # FreshTyre stays CONSTANT for every tyre age.
    if col == "FreshTyre":
        reference[col] = 0
    else:
        reference[col] = int(
            round(
                pd.to_numeric(
                    eligible[col],
                    errors="coerce"
                ).median()
            )
        )


print("\nSHARED REFERENCE CONTEXT")
print("-" * 70)

for k, v in reference.items():
    print(f"{k:35s}: {v}")


# ============================================================
# LOAD MODELS
# ============================================================

import joblib

models = {}


if LGB_PATH:
    try:
        models["LightGBM"] = joblib.load(LGB_PATH)
        print("\nLoaded LightGBM")
    except Exception as e:
        print("Could not load LightGBM:", e)


if XGB_PATH:
    try:
        models["XGBoost"] = joblib.load(XGB_PATH)
        print("Loaded XGBoost")
    except Exception as e:
        print("Could not load XGBoost:", e)


if CAT_PATH:
    try:
        models["CatBoost"] = joblib.load(CAT_PATH)
        print("Loaded CatBoost")
    except Exception as e:
        print("Could not load CatBoost:", e)


if not models:
    raise RuntimeError(
        "\nNo model files were loaded.\n"
        "Check MODEL_DIR and model filenames."
    )


# ============================================================
# CREATE INPUT
# ============================================================

def make_input(compound, age):

    row = reference.copy()

    row["Compound"] = compound

    # ONLY tyre-age variables change
    row["TyreAge"] = age
    row["TyreAge_sq"] = age ** 2
    row["TyreAge_cb"] = age ** 3

    # FreshTyre NEVER changes during sweep
    row["FreshTyre"] = reference["FreshTyre"]

    return pd.DataFrame([row])[FEATURES]


# ============================================================
# MODEL PREDICTION HELPERS
# ============================================================

def predict_model(model_name, model, X):

    """
    Handles the common sklearn / native APIs.

    If your existing predictor has custom preprocessing,
    this diagnostic may need to use that same preprocessing.
    """

    # ----------------------------
    # CatBoost
    # ----------------------------
    if model_name == "CatBoost":

        try:
            return float(
                model.predict(X)[0]
            )
        except Exception:

            X2 = X.copy()

            for c in CAT_COLS:
                X2[c] = X2[c].astype(str)

            return float(
                model.predict(X2)[0]
            )

    # ----------------------------
    # XGBoost
    # ----------------------------
    if model_name == "XGBoost":

        # Native XGBoost Booster
        if hasattr(model, "get_booster"):

            import xgboost as xgb

            X2 = X.copy()

            for c in CAT_COLS:
                X2[c] = (
                    X2[c]
                    .astype("category")
                    .cat.codes
                )

            dm = xgb.DMatrix(X2)

            return float(
                model.predict(dm)[0]
            )

        # sklearn XGBRegressor
        else:

            X2 = X.copy()

            for c in CAT_COLS:
                X2[c] = (
                    X2[c]
                    .astype("category")
                    .cat.codes
                )

            return float(
                model.predict(X2)[0]
            )

    # ----------------------------
    # LightGBM
    # ----------------------------
    if model_name == "LightGBM":

        try:
            return float(
                model.predict(X)[0]
            )
        except Exception:

            X2 = X.copy()

            for c in CAT_COLS:
                X2[c] = X2[c].astype("category")

            return float(
                model.predict(X2)[0]
            )

    raise ValueError(
        f"Unknown model: {model_name}"
    )


# ============================================================
# GENERATE CURVES
# ============================================================

all_results = []

print("\n")
print("=" * 70)
print("GENERATING TYRE-AGE CURVES")
print("=" * 70)

for compound in COMPOUNDS:

    print(f"\n{compound}")

    for age in AGES:

        X = make_input(
            compound,
            age
        )

        row = {
            "compound": compound,
            "tyre_age": age,
        }

        predictions = {}

        for model_name, model in models.items():

            try:

                pred = predict_model(
                    model_name,
                    model,
                    X
                )

                predictions[model_name] = pred

                row[
                    model_name
                    .lower()
                    .replace(" ", "_")
                ] = pred

            except Exception as e:

                print(
                    f"Prediction failed: "
                    f"{model_name} / "
                    f"{compound} / "
                    f"age {age}: {e}"
                )

                predictions[model_name] = np.nan

        # Ensemble = mean of available models
        valid_preds = [
            v for v in predictions.values()
            if np.isfinite(v)
        ]

        row["ensemble"] = (
            np.mean(valid_preds)
            if valid_preds
            else np.nan
        )

        all_results.append(row)


curves = pd.DataFrame(all_results)


# ============================================================
# CONVERT ABSOLUTE PREDICTION → AGE-RELATED PACE LOSS
# ============================================================

print("\nCalculating age-related pace loss...")

for model_col in [
    "lightgbm",
    "xgboost",
    "catboost",
    "ensemble",
]:

    if model_col not in curves.columns:
        continue

    curves[
        f"{model_col}_pace_loss"
    ] = (
        curves
        .groupby("compound")[model_col]
        .transform(
            lambda s: s - s.iloc[0]
        )
    )


# ============================================================
# SUMMARY
# ============================================================

print("\n")
print("=" * 70)
print("DEGRADATION SUMMARY")
print("=" * 70)

summary_rows = []

for compound in COMPOUNDS:

    c = curves[
        curves["compound"] == compound
    ].sort_values("tyre_age")

    print("\n" + compound)
    print("-" * 50)

    for model_col in [
        "lightgbm",
        "xgboost",
        "catboost",
        "ensemble",
    ]:

        loss_col = f"{model_col}_pace_loss"

        if loss_col not in c:
            continue

        y = c[loss_col].values
        x = c["tyre_age"].values

        # 10-lap age change: age 1 -> age 10
        loss_10 = float(
            c.loc[
                c["tyre_age"] == 10,
                loss_col
            ].iloc[0]
        )

        # 20-lap age change
        loss_20 = float(
            c.loc[
                c["tyre_age"] == 20,
                loss_col
            ].iloc[0]
        )

        # 40-lap age change
        loss_40 = float(
            c.loc[
                c["tyre_age"] == 40,
                loss_col
            ].iloc[0]
        )

        # Linear slope — secondary diagnostic only
        slope = float(
            np.polyfit(x, y, 1)[0]
        )

        print(
            f"{model_col.upper():10s} | "
            f"10-age loss: {loss_10:+.4f} s | "
            f"20-age loss: {loss_20:+.4f} s | "
            f"40-age loss: {loss_40:+.4f} s | "
            f"slope: {slope:+.5f}"
        )

        summary_rows.append({
            "compound": compound,
            "model": model_col,
            "loss_age_1_to_10": loss_10,
            "loss_age_1_to_20": loss_20,
            "loss_age_1_to_40": loss_40,
            "linear_slope": slope,
        })


summary = pd.DataFrame(summary_rows)


# ============================================================
# PRINT ORDERINGS
# ============================================================

print("\n")
print("=" * 70)
print("COMPOUND ORDERING")
print("=" * 70)

for metric in [
    "loss_age_1_to_10",
    "loss_age_1_to_20",
    "loss_age_1_to_40",
    "linear_slope",
]:

    print(f"\nBy {metric}:")

    for model_name in [
        "lightgbm",
        "xgboost",
        "catboost",
        "ensemble",
    ]:

        s = summary[
            summary["model"] == model_name
        ].sort_values(
            metric,
            ascending=False
        )

        order = " > ".join(
            s["compound"].tolist()
        )

        print(
            f"{model_name.upper():10s}: {order}"
        )


# ============================================================
# SAVE NEW FILES
# ============================================================

curve_file = (
    "DIAGNOSTIC_FIXED_FRESHTYRE_ALL_MODELS_CURVES.csv"
)

summary_file = (
    "DIAGNOSTIC_FIXED_FRESHTYRE_ALL_MODELS_SUMMARY.csv"
)

curves.to_csv(
    curve_file,
    index=False
)

summary.to_csv(
    summary_file,
    index=False
)


# ============================================================
# FINAL
# ============================================================

print("\n")
print("=" * 70)
print("DONE")
print("=" * 70)

print("\nCreated NEW diagnostic files:")

print(" ", curve_file)
print(" ", summary_file)

print("\nNO models were retrained.")
print("NO existing model files were modified.")
print("FreshTyre was held constant.")
print("Same reference context was used for all compounds.")

print("\nIMPORTANT:")
print(
    "Do NOT use these results in the frontend yet."
)
print(
    "Send me the complete terminal output first."
)