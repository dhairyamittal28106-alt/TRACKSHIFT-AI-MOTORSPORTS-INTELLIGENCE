
from pathlib import Path
import json
import warnings

import numpy as np
import pandas as pd
import lightgbm as lgb
import xgboost as xgb
from catboost import CatBoostRegressor

warnings.filterwarnings("ignore")



BASE_DIR = Path(__file__).resolve().parent

LGB_PATH = BASE_DIR / "lgb_model.txt"
XGB_PATH = BASE_DIR / "xgb_model_CORRECTED.json"
XGB_CATEGORY_MAPS_PATH = BASE_DIR / "xgb_category_maps.json"
CAT_PATH = BASE_DIR / "catboost_model.cbm"

WEIGHTS_PATH = BASE_DIR / "ensemble_weights.json"
CONFIG_PATH = BASE_DIR / "feature_config.json"

DATASET_PATH = (
    BASE_DIR / "ENRICHED_TYRE_DATASET_2022_ONWARDS.csv"
)



required_files = [
    LGB_PATH,
    XGB_PATH,
    XGB_CATEGORY_MAPS_PATH,
    CAT_PATH,
    WEIGHTS_PATH,
    CONFIG_PATH,
    DATASET_PATH,
]

for file_path in required_files:
    if not file_path.exists():
        raise FileNotFoundError(
            f"\nMissing required file:\n{file_path}\n\n"
            f"Make sure all required files are in:\n{BASE_DIR}"
        )



with open(CONFIG_PATH, "r") as f:
    config = json.load(f)

FEATURES = config["FEATURES"]
CAT_COLS = config["CAT_COLS"]
NUM_COLS = config["NUM_COLS"]
BOOL_COLS = config["BOOL_COLS"]



with open(WEIGHTS_PATH, "r") as f:
    weights = json.load(f)

WL = float(weights["lightgbm"])
WX = float(weights["xgboost"])
WC = float(weights["catboost"])



print("Loading dataset...")

df = pd.read_csv(DATASET_PATH)

print(f"✓ Raw dataset loaded: {len(df):,} rows")



print("Preparing feature engineering...")



df = df[
    df["ModelEligible"] == True
].copy()



VALID_COMPOUNDS = [
    "SOFT",
    "MEDIUM",
    "HARD",
    "INTERMEDIATE",
    "WET",
]

df = df[
    df["Compound"].isin(VALID_COMPOUNDS)
].copy()



REQUIRED = [
    "LapTimeSeconds",
    "TyreAge",
    "Compound",
    "Team",
    "Driver",
    "Stint",
    "Year",
    "Event",
    "SessionName",
    "LapNumber",
]

df = df.dropna(
    subset=REQUIRED
).copy()

df = df[
    df["LapTimeSeconds"] > 0
].copy()



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
    df["SessionKey"]
    + "_"
    + df["Driver"].astype(str)
    + "_"
    + df["Stint"].astype(str)
)



med = df.groupby(
    "SessionKey"
)["LapTimeSeconds"].transform("median")

df = df[
    df["LapTimeSeconds"] <= med * 1.5
].copy()



df = df.sort_values(
    [
        "SessionKey",
        "Driver",
        "LapNumber",
    ]
).reset_index(drop=True)





df["SessionPaceEvolution"] = (
    df.groupby(
        "SessionKey"
    )["LapTimeSeconds"]
    .transform(
        lambda s:
        s.shift(1)
        .expanding()
        .median()
    )
)



df["DriverBestSoFar"] = (
    df.groupby(
        [
            "SessionKey",
            "Driver",
        ]
    )["LapTimeSeconds"]
    .transform(
        lambda s:
        s.shift(1)
        .expanding()
        .min()
    )
)



global_pace_fallback = (
    df["LapTimeSeconds"].median()
)

df["SessionPaceEvolution"] = (
    df["SessionPaceEvolution"]
    .fillna(global_pace_fallback)
)

df["DriverBestSoFar"] = (
    df["DriverBestSoFar"]
    .fillna(global_pace_fallback)
)



df["TyreAge_sq"] = (
    df["TyreAge"] ** 2
)

df["TyreAge_cb"] = (
    df["TyreAge"] ** 3
)



gap_cols = [
    "TrafficGapMean_V4",
    "TrafficGapMedian_V4",
    "TrafficGapMin_V4",
    "TrafficGapStd_V4",
]

for c in gap_cols:

    if c in df.columns:

        if df[c].notnull().any():
            fill_val = df[c].max() * 2
        else:
            fill_val = 999.0

        df[c] = df[c].fillna(
            fill_val
        )


frac_cols = [
    "TrafficCloseFraction_V4",
    "TrafficVeryCloseFraction_V4",
    "TrafficExposureScore_V4",
    "TrafficDriverAheadFraction_V4",
]

for c in frac_cols:

    if c in df.columns:
        df[c] = df[c].fillna(0.0)


if "TrafficExposureLevel_V4" in df.columns:

    df["TrafficExposureLevel_V4"] = (
        df["TrafficExposureLevel_V4"]
        .fillna("NONE")
    )



for c in [
    "FreshTyre",
    "Rainfall",
]:

    if c in df.columns:
        df[c] = df[c].astype(float)


print("✓ Feature engineering complete")
print(f"✓ Cleaned rows: {len(df):,}")




for c in CAT_COLS:
    df[c] = df[c].astype("category")



CATEGORY_MAPS = {
    c: df[c].cat.categories.tolist()
    for c in CAT_COLS
}

with open(XGB_CATEGORY_MAPS_PATH, "r", encoding="utf-8") as f:
    XGB_CATEGORY_MAPS = json.load(f)



missing_features = [
    feature
    for feature in FEATURES
    if feature not in df.columns
]

if missing_features:
    raise ValueError(
        "\nThe following model features are missing:\n"
        + "\n".join(
            f"  - {x}"
            for x in missing_features
        )
    )

print(
    f"✓ All {len(FEATURES)} model features are available"
)



print("\nLoading trained models...")



lgb_model = lgb.Booster(
    model_file=str(LGB_PATH)
)



xgb_model = xgb.Booster()

xgb_model.load_model(
    str(XGB_PATH)
)



cat_model = CatBoostRegressor()

cat_model.load_model(
    str(CAT_PATH)
)


print("✓ LightGBM loaded")
print("✓ XGBoost loaded")
print("✓ CatBoost loaded")



print("\nEnsemble weights:")

print(
    f"  LightGBM : {WL:.5f}"
)

print(
    f"  XGBoost  : {WX:.5f}"
)

print(
    f"  CatBoost : {WC:.5f}"
)



def most_common(series):
    """
    Return the most common non-null value.
    """

    s = series.dropna()

    if len(s) == 0:
        return None

    return s.mode().iloc[0]


def median_numeric(series):
    """
    Return numeric median.
    """

    s = pd.to_numeric(
        series,
        errors="coerce"
    ).dropna()

    if len(s) == 0:
        return 0.0

    return float(
        s.median()
    )



def build_reference(compound):

    compound = str(
        compound
    ).upper()

    if compound not in [
        "SOFT",
        "MEDIUM",
        "HARD",
    ]:
        raise ValueError(
            "Compound must be SOFT, MEDIUM or HARD."
        )

    base = df[
        df["Compound"].astype(str).str.upper()
        == compound
    ].copy()

    if len(base) == 0:
        raise ValueError(
            f"No data found for compound: {compound}"
        )

    row = {}

    for feature in FEATURES:

        if feature in CAT_COLS:

            row[feature] = most_common(
                base[feature]
            )

        else:

            row[feature] = median_numeric(
                base[feature]
            )

    row["Compound"] = compound

    return pd.DataFrame(
        [row],
        columns=FEATURES
    )



def prepare_lgb(X):

    X = X.copy()

    feature_names = (
        lgb_model.feature_name()
    )

    pandas_categories = getattr(
        lgb_model,
        "pandas_categorical",
        [],
    )

    lgb_cat_cols = [
        c
        for c in FEATURES
        if c in CAT_COLS
        and c in feature_names
    ]


    if (
        len(pandas_categories)
        == len(lgb_cat_cols)
    ):

        for c, cats in zip(
            lgb_cat_cols,
            pandas_categories,
        ):

            X[c] = pd.Categorical(
                X[c].astype(str),
                categories=cats,
            )

    else:

        for c in lgb_cat_cols:

            cats = CATEGORY_MAPS[c]

            X[c] = pd.Categorical(
                X[c].astype(str),
                categories=cats,
            )


    for c in X.columns:

        if c not in lgb_cat_cols:

            X[c] = pd.to_numeric(
                X[c],
                errors="coerce",
            )

    return X



def prepare_xgb(X):

    X = X.copy()


    for c in CAT_COLS:

        if c in X.columns:

            mapping = XGB_CATEGORY_MAPS[c]

            X[c] = (
                X[c]
                .astype(object)
                .map(mapping)
                .fillna(-1)
                .astype("int32")
            )


    for c in X.columns:

        X[c] = pd.to_numeric(
            X[c],
            errors="coerce",
        )

    return X




def prepare_cat(X):

    X = X.copy()

    cat_indices = (
        cat_model.get_cat_feature_indices()
    )

    feature_names = list(
        cat_model.feature_names_
    )

    cat_names = [
        feature_names[i]
        for i in cat_indices
        if i < len(feature_names)
    ]

    for c in cat_names:

        if c in X.columns:

            X[c] = (
                X[c]
                .astype(object)
                .where(
                    X[c].notna(),
                    "MISSING",
                )
                .astype(str)
            )

    for c in X.columns:

        if c not in cat_names:

            X[c] = pd.to_numeric(
                X[c],
                errors="coerce",
            )

    return X



def predict_models(X):

    X = X[
        FEATURES
    ].copy()



    X_lgb = prepare_lgb(X)

    pred_lgb = float(
        lgb_model.predict(
            X_lgb
        )[0]
    )



    X_xgb = prepare_xgb(X)

    dmatrix = xgb.DMatrix(
        X_xgb,
        feature_names=FEATURES,
    )

    pred_xgb = float(
        xgb_model.predict(
            dmatrix
        )[0]
    )



    X_cat = prepare_cat(X)

    pred_cat = float(
        cat_model.predict(
            X_cat
        )[0]
    )



    ensemble = (
        WL * pred_lgb
        + WX * pred_xgb
        + WC * pred_cat
    )

    return (
        pred_lgb,
        pred_xgb,
        pred_cat,
        float(ensemble),
    )



def predict_tyre(
    compound,
    tyre_age,
):

    compound = str(
        compound
    ).upper()

    tyre_age = int(
        tyre_age
    )

    if compound not in [
        "SOFT",
        "MEDIUM",
        "HARD",
    ]:
        raise ValueError(
            "Compound must be SOFT, MEDIUM or HARD."
        )

    if tyre_age < 1:
        raise ValueError(
            "Tyre age must be >= 1."
        )



    X = build_reference(
        compound
    )



    if "TyreAge" in X.columns:

        X.loc[
            0,
            "TyreAge"
        ] = float(
            tyre_age
        )



    if "TyreAge_sq" in X.columns:

        X.loc[
            0,
            "TyreAge_sq"
        ] = (
            float(tyre_age) ** 2
        )



    if "TyreAge_cb" in X.columns:

        X.loc[
            0,
            "TyreAge_cb"
        ] = (
            float(tyre_age) ** 3
        )



    if "FreshTyre" in X.columns:

        X.loc[
            0,
            "FreshTyre"
        ] = (
            1.0
            if tyre_age == 1
            else 0.0
        )



    X.loc[
        0,
        "Compound"
    ] = compound



    (
        pred_lgb,
        pred_xgb,
        pred_cat,
        ensemble,
    ) = predict_models(
        X
    )


    return {
        "compound": compound,
        "tyre_age": tyre_age,
        "lightgbm_s": pred_lgb,
        "xgboost_s": pred_xgb,
        "catboost_s": pred_cat,
        "ensemble_s": ensemble,
    }


print("\n")
print("=" * 80)
print("XGBOOST MODEL INSPECTION")
print("=" * 80)

print("\nXGBoost model feature names:")
print(xgb_model.feature_names)

print("\nOur FEATURES:")
print(FEATURES)

print("\nNumber of XGBoost features:",
      len(xgb_model.feature_names)
      if xgb_model.feature_names is not None
      else "None")

print("Number of FEATURES:",
      len(FEATURES))

print("\nCategory mappings:")

for c in CAT_COLS:
    print(
        f"\n{c}: "
        f"{len(CATEGORY_MAPS[c])} categories"
    )
    print(CATEGORY_MAPS[c][:20])




def run_xgb_diagnostic():

    print("\n")
    print("=" * 80)
    print("XGBOOST MODEL DIAGNOSTIC")
    print("=" * 80)


    print("\n")
    print("-" * 80)
    print("TEST 1: REAL DATASET ROWS")
    print("-" * 80)

    test_rows = df[
        FEATURES
    ].sample(
        n=5,
        random_state=42
    ).copy()

    X_test_xgb = prepare_xgb(
        test_rows
    )

    dm_test = xgb.DMatrix(
        X_test_xgb,
        feature_names=FEATURES
    )

    real_predictions = (
        xgb_model.predict(dm_test)
    )

    print("\nActual vs XGBoost prediction:")

    for i, (idx, row) in enumerate(
        test_rows.iterrows()
    ):

        actual = float(
            df.loc[
                idx,
                "LapTimeSeconds"
            ]
        )

        prediction = float(
            real_predictions[i]
        )

        print(
            f"\nRow {i + 1}"
        )

        print(
            f"  Compound   : "
            f"{row['Compound']}"
        )

        print(
            f"  Tyre Age   : "
            f"{row['TyreAge']}"
        )

        print(
            f"  Actual lap : "
            f"{actual:.6f} s"
        )

        print(
            f"  XGBoost    : "
            f"{prediction:.6f} s"
        )



    print("\n")
    print("-" * 80)
    print("TEST 2: CONTROLLED REFERENCE")
    print("-" * 80)

    controlled_results = []

    for compound in [
        "SOFT",
        "MEDIUM",
        "HARD",
    ]:

        result = predict_tyre(
            compound,
            10
        )

        controlled_results.append(
            result
        )

        print(
            f"\n{compound} - Tyre Age 10"
        )

        print(
            f"  LightGBM : "
            f"{result['lightgbm_s']:.6f} s"
        )

        print(
            f"  XGBoost  : "
            f"{result['xgboost_s']:.6f} s"
        )

        print(
            f"  CatBoost : "
            f"{result['catboost_s']:.6f} s"
        )

        print(
            f"  Ensemble : "
            f"{result['ensemble_s']:.6f} s"
        )



    real_ok = all(
        np.isfinite(real_predictions)
    ) and all(
        real_predictions > 0
    )

    controlled_ok = all(
        np.isfinite(
            r["xgboost_s"]
        )
        and r["xgboost_s"] > 0
        for r in controlled_results
    )


    print("\n")
    print("=" * 80)
    print("DIAGNOSTIC RESULT")
    print("=" * 80)

    if real_ok:

        print(
            "\n✓ XGBoost gives positive predictions "
            "on REAL dataset rows."
        )

        if not controlled_ok:

            print(
                "\n❌ XGBoost fails only on the "
                "CONTROLLED reference rows."
            )

            print(
                "\nThis means the saved XGBoost model "
                "is probably fine."
            )

            print(
                "The problem is most likely the "
                "representative/controlled input "
                "being constructed for prediction."
            )

            return False

        else:

            print(
                "\n✓ XGBoost also works on the "
                "controlled reference."
            )

            return True

    else:

        print(
            "\n❌ XGBoost gives invalid predictions "
            "even on REAL dataset rows."
        )

        print(
            "\nThis means we need to investigate "
            "the saved XGBoost model/training export."
        )

        return False

def degradation_curve(
    compound,
    age_min=1,
    age_max=40,
):

    compound = str(
        compound
    ).upper()

    baseline_result = predict_tyre(
        compound,
        age_min,
    )

    baseline = (
        baseline_result[
            "ensemble_s"
        ]
    )

    results = []

    for age in range(
        age_min,
        age_max + 1,
    ):

        result = predict_tyre(
            compound,
            age,
        )

        result[
            "degradation_s"
        ] = (
            result["ensemble_s"]
            - baseline
        )

        results.append(
            result
        )

    return pd.DataFrame(
        results
    )



def all_degradation_curves(
    age_min=1,
    age_max=40,
):

    curves = []

    for compound in [
        "SOFT",
        "MEDIUM",
        "HARD",
    ]:

        print(
            f"Generating {compound} curve..."
        )

        curve = degradation_curve(
            compound,
            age_min,
            age_max,
        )

        curves.append(
            curve
        )

    return pd.concat(
        curves,
        ignore_index=True,
    )



def degradation_summary(
    age_min=1,
    age_max=40,
):

    curves = (
        all_degradation_curves(
            age_min,
            age_max,
        )
    )

    summaries = []

    for compound, data in curves.groupby(
        "compound"
    ):

        data = data.sort_values(
            "tyre_age"
        )

        x = data[
            "tyre_age"
        ].values.astype(float)

        y = data[
            "ensemble_s"
        ].values.astype(float)



        slope = np.polyfit(
            x,
            y,
            1,
        )[0]



        total = (
            y[-1]
            - y[0]
        )



        if x[-1] != x[0]:

            average = (
                total
                / (x[-1] - x[0])
            )

        else:

            average = 0.0


        summaries.append({

            "Compound":
                compound,

            "Linear degradation (s/lap)":
                slope,

            "Average degradation (s/lap)":
                average,

            "Starting predicted lap time (s)":
                y[0],

            "Ending predicted lap time (s)":
                y[-1],

            "Total degradation (s)":
                total,

        })


    return (
        pd.DataFrame(
            summaries
        ),
        curves,
    )



if __name__ == "__main__":

    print("\n")
    print("=" * 80)
    print(
        "TRACKSHIFT TYRE DEGRADATION PREDICTOR"
    )
    print("=" * 80)

    print(
        "\nModels loaded successfully."
    )

    print(
        f"Features expected: "
        f"{len(FEATURES)}"
    )



    diagnostic_ok = run_xgb_diagnostic()



    if not diagnostic_ok:

        print("\n")
        print("=" * 80)
        print("PREDICTION STOPPED FOR SAFETY")
        print("=" * 80)

        print(
            "\nNo degradation CSVs were generated."
        )

        print(
            "Fix the XGBoost input encoding first."
        )

        raise SystemExit(1)



    print("\n")
    print("=" * 80)
    print(
        "CONTROLLED TYRE DEGRADATION"
    )
    print("=" * 80)


    summary, curves = (
        degradation_summary(
            age_min=1,
            age_max=40,
        )
    )


    print(
        "\n"
        + summary.to_string(
            index=False,
            float_format=lambda x:
            f"{x:.5f}",
        )
    )



    summary_path = (
        BASE_DIR
        / "PREDICTION_DEGRADATION_SUMMARY.csv"
    )

    curves_path = (
        BASE_DIR
        / "PREDICTION_DEGRADATION_CURVES.csv"
    )


    summary.to_csv(
        summary_path,
        index=False,
    )

    curves.to_csv(
        curves_path,
        index=False,
    )



    print("\n")
    print("=" * 80)
    print(
        "✓ PREDICTION COMPLETE"
    )
    print("=" * 80)

    print(
        "\nCreated:"
    )

    print(
        f"  {summary_path.name}"
    )

    print(
        f"  {curves_path.name}"
    )

    print("\n✓ No model retraining was performed.")
    print("✓ Existing LightGBM model was used.")
    print("✓ Existing XGBoost model was used.")
    print("✓ Existing CatBoost model was used.")