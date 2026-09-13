
import os
import json
import warnings
import numpy as np
import pandas as pd
import xgboost as xgb

from sklearn.model_selection import GroupKFold
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score
)

from scipy.stats import spearmanr

warnings.filterwarnings("ignore")

SEED = 42
np.random.seed(SEED)


DATA_PATH = r"ENRICHED_TYRE_DATASET_2022_ONWARDS.csv"

N_SPLITS = 5


print("=" * 70)
print("TRACKSHIFT - XGBOOST ONLY TRAINING")
print("=" * 70)

df = pd.read_csv(DATA_PATH)

print("Original shape:", df.shape)


if "ModelEligible" in df.columns:
    df = df[df["ModelEligible"] == True].copy()

VALID_COMPOUNDS = [
    "SOFT",
    "MEDIUM",
    "HARD",
    "INTERMEDIATE",
    "WET"
]

if "Compound" in df.columns:
    df = df[df["Compound"].isin(VALID_COMPOUNDS)].copy()

REQUIRED_COLUMNS = [
    "LapTimeSeconds",
    "TyreAge",
    "Compound",
    "Team",
    "Driver",
    "Stint",
    "Year",
    "Event",
    "SessionName",
    "LapNumber"
]

missing_cols = [
    c for c in REQUIRED_COLUMNS
    if c not in df.columns
]

if missing_cols:
    raise ValueError(
        f"Missing required columns: {missing_cols}"
    )

df = df.dropna(
    subset=REQUIRED_COLUMNS
).copy()

df = df[
    df["LapTimeSeconds"] > 0
].copy()


if "YellowFlagAffected" in df.columns:
    df = df[
        df["YellowFlagAffected"] == False
    ].copy()


df["SessionKey"] = (
    df["Year"].astype(str)
    + "_"
    + df["Event"].astype(str)
    + "_"
    + df["SessionName"].astype(str)
)

df["StintKey"] = (
    df["SessionKey"].astype(str)
    + "_"
    + df["Driver"].astype(str)
    + "_"
    + df["Team"].astype(str)
    + "_"
    + df["Stint"].astype(str)
)


session_median = (
    df.groupby("SessionKey")["LapTimeSeconds"]
    .transform("median")
)

df = df[
    df["LapTimeSeconds"] <= session_median * 1.5
].copy()

print(
    f"Rows after cleaning: {len(df)}  | "
    f"Stints: {df['StintKey'].nunique()}"
)


df = df.sort_values(
    [
        "SessionKey",
        "Driver",
        "Stint",
        "LapNumber"
    ]
).reset_index(drop=True)


df["SessionPaceEvolution"] = (
    df.groupby("SessionKey")["LapTimeSeconds"]
    .transform(
        lambda s:
        s.shift(1).expanding().median()
    )
)


df["DriverBestSoFar"] = (
    df.groupby(
        ["Year", "Driver"]
    )["LapTimeSeconds"]
    .transform(
        lambda s:
        s.shift(1).expanding().min()
    )
)


global_median_lap = df["LapTimeSeconds"].median()

df["SessionPaceEvolution"] = (
    df["SessionPaceEvolution"]
    .fillna(global_median_lap)
)

df["DriverBestSoFar"] = (
    df["DriverBestSoFar"]
    .fillna(global_median_lap)
)


df["TyreAge_sq"] = (
    df["TyreAge"] ** 2
)

df["TyreAge_cb"] = (
    df["TyreAge"] ** 3
)


TRAFFIC_GAP_COLS = [
    "TrafficGapMean_V4",
    "TrafficGapMedian_V4",
    "TrafficGapMin_V4",
    "TrafficGapStd_V4"
]

for c in TRAFFIC_GAP_COLS:
    if c in df.columns:
        max_val = df[c].max()

        if pd.isna(max_val):
            max_val = 999.0

        df[c] = (
            df[c]
            .fillna(max_val * 2)
        )

TRAFFIC_FRACTION_COLS = [
    "TrafficCloseFraction_V4",
    "TrafficVeryCloseFraction_V4",
    "TrafficExposureScore_V4",
    "TrafficDriverAheadFraction_V4"
]

for c in TRAFFIC_FRACTION_COLS:
    if c in df.columns:
        df[c] = (
            df[c]
            .fillna(0)
        )

if "TrafficExposureLevel_V4" in df.columns:
    df["TrafficExposureLevel_V4"] = (
        df["TrafficExposureLevel_V4"]
        .fillna("NONE")
    )
else:
    df["TrafficExposureLevel_V4"] = "NONE"


if "FreshTyre" in df.columns:
    df["FreshTyre"] = (
        df["FreshTyre"]
        .fillna(False)
        .astype(float)
    )
else:
    df["FreshTyre"] = 0.0

if "Rainfall" in df.columns:
    df["Rainfall"] = (
        df["Rainfall"]
        .fillna(False)
        .astype(float)
    )
else:
    df["Rainfall"] = 0.0


DEFAULT_NUMERIC_VALUES = {
    "TrafficGapMean_V4": 999.0,
    "TrafficGapMedian_V4": 999.0,
    "TrafficGapMin_V4": 999.0,
    "TrafficGapStd_V4": 999.0,
    "TrafficCloseFraction_V4": 0.0,
    "TrafficVeryCloseFraction_V4": 0.0,
    "TrafficExposureScore_V4": 0.0,
    "TrafficDriverAheadFraction_V4": 0.0
}

for c, default_value in DEFAULT_NUMERIC_VALUES.items():

    if c not in df.columns:
        df[c] = default_value

    df[c] = (
        pd.to_numeric(
            df[c],
            errors="coerce"
        )
        .fillna(default_value)
    )


CAT_COLS = [
    "Driver",
    "Team",
    "Compound",
    "Event",
    "SessionName",
    "TrafficExposureLevel_V4"
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
    "TrafficGapMean_V4",
    "TrafficGapMedian_V4",
    "TrafficGapMin_V4",
    "TrafficGapStd_V4",
    "TrafficCloseFraction_V4",
    "TrafficVeryCloseFraction_V4",
    "TrafficExposureScore_V4",
    "TrafficDriverAheadFraction_V4",
    "SessionPaceEvolution",
    "DriverBestSoFar"
]

BOOL_COLS = [
    "FreshTyre",
    "Rainfall"
]

FEATURES = (
    CAT_COLS
    + NUM_COLS
    + BOOL_COLS
)

TARGET = "LapTimeSeconds"


missing_features = [
    c for c in FEATURES
    if c not in df.columns
]

if missing_features:
    raise ValueError(
        "Missing model features:\n"
        + "\n".join(missing_features)
    )


X = df[FEATURES].copy()
y = df[TARGET].astype(float).copy()

groups = df["StintKey"].copy()


for c in NUM_COLS + BOOL_COLS:

    X[c] = pd.to_numeric(
        X[c],
        errors="coerce"
    )

    X[c] = X[c].replace(
        [np.inf, -np.inf],
        np.nan
    )

    X[c] = X[c].fillna(
        X[c].median()
    )


for c in CAT_COLS:

    X[c] = (
        X[c]
        .astype(str)
        .fillna("UNKNOWN")
        .astype("category")
    )

print("Feature engineering done.")
print(
    f"Features: {len(FEATURES)} | "
    f"Rows: {len(X)}"
)


XGB_CATEGORY_MAPS = {}

for c in CAT_COLS:

    categories = list(
        X[c].cat.categories
    )

    XGB_CATEGORY_MAPS[c] = {
        category: index
        for index, category
        in enumerate(categories)
    }


def encode_xgb_categories(Xd):

    Xd = Xd.copy()

    for c in CAT_COLS:

        mapping = XGB_CATEGORY_MAPS[c]

        Xd[c] = (
            Xd[c]
            .astype(object)
            .map(mapping)
            .fillna(-1)
            .astype("int32")
        )

    return Xd[FEATURES]


xgb_params = dict(
    objective="reg:squarederror",
    eta=0.03,
    max_depth=8,
    subsample=0.85,
    colsample_bytree=0.85,
    min_child_weight=5,
    reg_alpha=0.1,
    reg_lambda=1.0,
    seed=SEED
)


gkf = GroupKFold(
    n_splits=N_SPLITS
)

oof_xgb = np.full(
    len(X),
    np.nan,
    dtype=float
)

xgb_models = []

best_iterations = []


print()
print("=" * 70)
print("STARTING XGBOOST CROSS-VALIDATION")
print("=" * 70)

for fold, (tr_idx, te_idx) in enumerate(
    gkf.split(
        X,
        y,
        groups=groups
    ),
    start=1
):

    print()
    print("-" * 70)
    print(f"FOLD {fold}/{N_SPLITS}")
    print("-" * 70)

    X_tr = X.iloc[tr_idx].copy()
    X_te = X.iloc[te_idx].copy()

    y_tr = y.iloc[tr_idx]
    y_te = y.iloc[te_idx]


    X_tr_xgb = encode_xgb_categories(
        X_tr
    )

    X_te_xgb = encode_xgb_categories(
        X_te
    )


    dtrain = xgb.DMatrix(
        X_tr_xgb,
        label=y_tr,
        feature_names=FEATURES
    )

    dvalid = xgb.DMatrix(
        X_te_xgb,
        label=y_te,
        feature_names=FEATURES
    )


    model = xgb.train(
        params=xgb_params,
        dtrain=dtrain,
        num_boost_round=3000,
        evals=[
            (dtrain, "train"),
            (dvalid, "valid")
        ],
        early_stopping_rounds=100,
        verbose_eval=False
    )


    preds = model.predict(
        dvalid,
        iteration_range=(
            0,
            model.best_iteration + 1
        )
    )

    oof_xgb[te_idx] = preds

    xgb_models.append(model)

    best_iterations.append(
        model.best_iteration
    )


    fold_rmse = np.sqrt(
        mean_squared_error(
            y_te,
            preds
        )
    )

    fold_mae = mean_absolute_error(
        y_te,
        preds
    )

    fold_r2 = r2_score(
        y_te,
        preds
    )

    fold_spearman = spearmanr(
        y_te,
        preds
    ).statistic

    print(
        f"Best iteration: "
        f"{model.best_iteration}"
    )

    print(
        f"RMSE      : {fold_rmse:.4f}"
    )

    print(
        f"MAE       : {fold_mae:.4f}"
    )

    print(
        f"R2        : {fold_r2:.4f}"
    )

    print(
        f"Spearman  : {fold_spearman:.4f}"
    )

    print(
        f"Actual range : "
        f"{y_te.min():.3f} - {y_te.max():.3f}"
    )

    print(
        f"Pred range   : "
        f"{preds.min():.3f} - {preds.max():.3f}"
    )


valid_mask = np.isfinite(
    oof_xgb
)

y_oof = y.values[
    valid_mask
]

pred_oof = oof_xgb[
    valid_mask
]

print()
print("=" * 70)
print("XGBOOST OOF RESULTS")
print("=" * 70)

oof_rmse = np.sqrt(
    mean_squared_error(
        y_oof,
        pred_oof
    )
)

oof_mae = mean_absolute_error(
    y_oof,
    pred_oof
)

oof_r2 = r2_score(
    y_oof,
    pred_oof
)

oof_spearman = spearmanr(
    y_oof,
    pred_oof
).statistic

print(
    f"RMSE      : {oof_rmse:.6f}"
)

print(
    f"MAE       : {oof_mae:.6f}"
)

print(
    f"R2        : {oof_r2:.6f}"
)

print(
    f"Spearman  : {oof_spearman:.6f}"
)

print()
print(
    f"Target range      : "
    f"{y.min():.3f} - {y.max():.3f}"
)

print(
    f"OOF prediction range : "
    f"{pred_oof.min():.3f} - "
    f"{pred_oof.max():.3f}"
)


print()
print("=" * 70)
print("FIRST 20 ACTUAL VS XGBOOST PREDICTIONS")
print("=" * 70)

comparison = pd.DataFrame({
    "Actual": y_oof[:20],
    "XGB_Predicted": pred_oof[:20]
})

comparison["Error"] = (
    comparison["XGB_Predicted"]
    - comparison["Actual"]
)

print(
    comparison.to_string(
        index=False
    )
)


print()
print("=" * 70)
print("COMPOUND-WISE OOF PERFORMANCE")
print("=" * 70)

compound_values = (
    df["Compound"]
    .astype(str)
    .values
)

for compound in VALID_COMPOUNDS:

    mask = (
        valid_mask
        & (
            compound_values
            == compound
        )
    )

    if mask.sum() == 0:
        continue

    actual_c = y.values[mask]
    pred_c = oof_xgb[mask]

    rmse_c = np.sqrt(
        mean_squared_error(
            actual_c,
            pred_c
        )
    )

    mae_c = mean_absolute_error(
        actual_c,
        pred_c
    )

    r2_c = r2_score(
        actual_c,
        pred_c
    )

    spear_c = spearmanr(
        actual_c,
        pred_c
    ).statistic

    print()
    print(
        f"{compound}"
    )

    print(
        f"  Rows     : {len(actual_c)}"
    )

    print(
        f"  RMSE     : {rmse_c:.4f}"
    )

    print(
        f"  MAE      : {mae_c:.4f}"
    )

    print(
        f"  R2       : {r2_c:.4f}"
    )

    print(
        f"  Spearman : {spear_c:.4f}"
    )


print()
print("=" * 70)
print("TYRE AGE PREDICTION CHECK")
print("=" * 70)

age_check = pd.DataFrame({
    "TyreAge": df.loc[
        valid_mask,
        "TyreAge"
    ].values,

    "Compound": df.loc[
        valid_mask,
        "Compound"
    ].values,

    "Actual": y_oof,

    "Predicted": pred_oof
})

age_summary = (
    age_check
    .groupby(
        ["Compound", "TyreAge"]
    )
    .agg(
        ActualMean=(
            "Actual",
            "mean"
        ),
        PredictedMean=(
            "Predicted",
            "mean"
        ),
        Count=(
            "Actual",
            "size"
        )
    )
    .reset_index()
)

print(
    age_summary.head(50).to_string(
        index=False
    )
)


print()
print("=" * 70)
print("XGBOOST FEATURE IMPORTANCE")
print("=" * 70)

importance_values = np.zeros(
    len(FEATURES)
)

for model in xgb_models:

    score = model.get_score(
        importance_type="gain"
    )

    for feature, value in score.items():

        if feature in FEATURES:

            importance_values[
                FEATURES.index(feature)
            ] += value

importance_values /= len(
    xgb_models
)

importance_df = pd.DataFrame({
    "Feature": FEATURES,
    "Importance": importance_values
})

importance_df = (
    importance_df
    .sort_values(
        "Importance",
        ascending=False
    )
)

print(
    importance_df.to_string(
        index=False
    )
)


mean_best_iteration = int(
    np.mean(best_iterations)
)

print()
print("=" * 70)
print("BEST ITERATION SUMMARY")
print("=" * 70)

print(
    "Fold best iterations:",
    best_iterations
)

print(
    "Mean best iteration:",
    mean_best_iteration
)


print()
print("=" * 70)
print("TRAINING FINAL FULL XGBOOST MODEL")
print("=" * 70)

X_full_xgb = encode_xgb_categories(
    X
)

d_full = xgb.DMatrix(
    X_full_xgb,
    label=y,
    feature_names=FEATURES
)

xgb_full = xgb.train(
    params=xgb_params,
    dtrain=d_full,
    num_boost_round=mean_best_iteration
)

print(
    "Final XGBoost model trained."
)


MODEL_PATH = "xgb_model_CORRECTED.json"

xgb_full.save_model(
    MODEL_PATH
)

print(
    f"Model saved to: {MODEL_PATH}"
)


CATEGORY_MAP_PATH = (
    "xgb_category_maps.json"
)

with open(
    CATEGORY_MAP_PATH,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        XGB_CATEGORY_MAPS,
        f,
        indent=2,
        ensure_ascii=False
    )

print(
    f"Category maps saved to: "
    f"{CATEGORY_MAP_PATH}"
)


FEATURE_CONFIG_PATH = (
    "xgb_feature_config.json"
)

feature_config = {
    "features": FEATURES,
    "categorical_features": CAT_COLS,
    "numeric_features": NUM_COLS,
    "boolean_features": BOOL_COLS,
    "target": TARGET
}

with open(
    FEATURE_CONFIG_PATH,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        feature_config,
        f,
        indent=2
    )

print(
    f"Feature config saved to: "
    f"{FEATURE_CONFIG_PATH}"
)


OOF_PATH = (
    "xgb_oof_predictions.csv"
)

oof_output = df[
    [
        "Year",
        "Event",
        "SessionName",
        "Driver",
        "Team",
        "Compound",
        "Stint",
        "LapNumber",
        "TyreAge"
    ]
].copy()

oof_output[
    "ActualLapTime"
] = y.values

oof_output[
    "XGB_Prediction"
] = oof_xgb

oof_output[
    "XGB_Error"
] = (
    oof_output["XGB_Prediction"]
    - oof_output["ActualLapTime"]
)

oof_output.to_csv(
    OOF_PATH,
    index=False
)

print(
    f"OOF predictions saved to: "
    f"{OOF_PATH}"
)


print()
print("=" * 70)
print("TRAINING COMPLETE")
print("=" * 70)

print()
print("FINAL XGBOOST OOF METRICS")
print(
    f"RMSE     : {oof_rmse:.6f}"
)
print(
    f"MAE      : {oof_mae:.6f}"
)
print(
    f"R2       : {oof_r2:.6f}"
)
print(
    f"Spearman : {oof_spearman:.6f}"
)

print()
print("Files created:")
print(
    f"  - {MODEL_PATH}"
)
print(
    f"  - {CATEGORY_MAP_PATH}"
)
print(
    f"  - {FEATURE_CONFIG_PATH}"
)
print(
    f"  - {OOF_PATH}"
)

print()
print("=" * 70)
print("DONE")
print("=" * 70)