import xgboost as xgb
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "xgb_model.json"

print("=" * 80)
print("XGBOOST SAVED MODEL INSPECTION")
print("=" * 80)

model = xgb.Booster()
model.load_model(str(MODEL_PATH))

print("\nModel loaded successfully.")

print("\nFeature names:")
print(model.feature_names)

print("\nNumber of features:")
print(
    len(model.feature_names)
    if model.feature_names is not None
    else None
)

print("\nNumber of boosted trees:")

try:
    print(model.num_boosted_rounds())
except Exception as e:
    print("Could not read:", e)

print("\nNumber of trees:")

try:
    print(len(model.get_dump()))
except Exception as e:
    print("Could not read:", e)

print("\nModel attributes:")
print(model.attributes())

print("\nModel configuration:")

try:
    print(model.save_config())
except Exception as e:
    print("Could not read configuration:", e)

print("\n" + "=" * 80)
print("DONE")
print("=" * 80)