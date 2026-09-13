# 🏎️ TrackShift — Tyre Degradation Intelligence

> **AI-powered tyre performance analysis and race strategy intelligence for motorsport.**

TrackShift is an AI-powered motorsport intelligence platform designed to analyze Formula 1 lap data and estimate how tyre performance changes as tyres age throughout a stint.

The core challenge is that **lap-time loss is not caused by tyre degradation alone**. Fuel load, traffic, weather, track evolution, driver performance, car performance, and session progression can all influence lap times.

TrackShift treats tyre degradation as a **signal-isolation problem**, using machine learning to separate the tyre-age effect from these surrounding factors.

---

## 🎯 Problem

A slower lap does not necessarily mean that the tyre has degraded by the same amount.

Lap performance can be affected by:

- 🛞 Tyre degradation
- ⛽ Fuel load
- 🚦 Traffic
- 🌡️ Weather conditions
- 🏁 Track evolution
- 🧑‍✈️ Driver performance
- 🏎️ Car performance
- 📈 Session progression

Simply comparing early- and late-stint lap times can therefore produce misleading tyre degradation estimates.

**TrackShift aims to isolate the tyre-related component of performance loss while controlling for these confounding factors.**

---

## 🧠 Solution

TrackShift uses an ensemble of machine-learning models to learn the relationship between lap performance, tyre age, and surrounding race conditions.

The system uses:

- **LightGBM**
- **XGBoost**
- **CatBoost**

The models are trained on structured Formula 1 lap data and combined into an ensemble for the final prediction.

After training, tyre age is varied while the surrounding context is controlled to generate **model-derived tyre degradation curves** for Soft, Medium, and Hard compounds.

---

## 🚀 Key Features

- 🛞 Tyre degradation estimation
- 📈 Tyre-age degradation curves
- 🤖 LightGBM + XGBoost + CatBoost ensemble
- 🚦 Traffic analysis
- 🌦️ Weather and track-condition analysis
- 🧑‍✈️ Driver and team performance modelling
- 🔬 Leakage-controlled feature engineering
- 🧪 Stint-level GroupKFold validation
- 📊 MAE, RMSE, R² and Spearman evaluation
- 🏁 Motorsport-focused intelligence dashboard
- 📋 Compound comparison and durability ranking
- 🎯 Controlled ML-based pace-loss analysis

---

## 🔬 Machine Learning Pipeline

```text
                     F1 Lap Data
                         │
                         ▼
                 Data Cleaning
                         │
                         ▼
                  Leakage Audit
                         │
                         ▼
              Causal Feature Engineering
                         │
                         ▼
                   Feature Matrix
                         │
                         ▼
                Stint-Level GroupKFold
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
          LightGBM    XGBoost    CatBoost
              │          │          │
              └──────────┼──────────┘
                         ▼
                   Ensemble Model
                         │
                         ▼
                Controlled Tyre-Age Sweep
                         │
                         ▼
                Tyre Degradation Curves
                         │
                         ▼
                 Strategy Intelligence
```

---

## 🛡️ Leakage Prevention

Preventing target leakage is a major part of the TrackShift methodology.

Same-lap information that directly describes the lap being predicted is excluded from the model.

Examples include:

- Lap-time components
- Sector times
- Speed traps
- Same-lap telemetry
- Personal-best indicators
- Duplicate target columns
- Same-lap timing-derived features

Track evolution and pace-reference features are reconstructed using information from **previous laps only**, ensuring that the current lap's own timing is not used to predict itself.

---

## 🧩 Feature Engineering

### Tyre Features

- Tyre age
- Tyre age²
- Tyre age³
- Fresh tyre indicator
- Compound

### Session Features

- Lap number
- Session progress
- Session type
- Event

### Weather Features

- Air temperature
- Track temperature
- Humidity
- Pressure
- Wind speed
- Rainfall

### Traffic Features

- Traffic gaps
- Traffic exposure
- Close-traffic fractions
- Driver-ahead exposure
- Traffic exposure level

### Driver & Team

- Driver
- Team

### Track Evolution

Track evolution features are reconstructed using previous lap information with `shift(1)` so that the current lap does not contribute to its own prediction.

---

## 🧪 Validation

TrackShift uses **5-Fold GroupKFold validation at the stint level**.

Laps from the same tyre stint are kept within the same group, preventing the same stint from appearing in both training and validation.

This is more appropriate than a random lap-level split because consecutive laps from the same stint are highly correlated.

---

## 📊 Model Performance

The final retrained models produced the following out-of-fold results:

| Model | MAE | RMSE | R² | Spearman |
|---|---:|---:|---:|---:|
| LightGBM | 4.183 s | 7.042 s | 0.8168 | 0.9177 |
| XGBoost | 3.969 s | 6.873 s | 0.8255 | 0.9206 |
| CatBoost | 3.793 s | 7.998 s | 0.7637 | 0.9009 |
| **Ensemble** | **3.803 s** | **7.012 s** | **0.8184** | **0.9215** |

The ensemble achieved a **Spearman correlation of 0.9215**, demonstrating a strong relationship between predicted and actual lap-time ranking.

---

## 🛞 Tyre Degradation Results

The controlled ML analysis produced the following ensemble degradation estimates:

| Compound | Estimated Degradation |
|---|---:|
| 🔴 Soft | **+0.03659 s/lap** |
| 🟠 Medium | **+0.02956 s/lap** |
| ⚪ Hard | **+0.02494 s/lap** |

Overall, the model estimates the following degradation ordering:

**Soft → Medium → Hard**

Soft shows the highest estimated pace-loss rate, while Hard shows the lowest.

> These values are **model-derived pace-loss estimates**, not direct physical measurements of rubber wear.

---

## 📈 Tyre Degradation Curves

TrackShift generates degradation curves by varying tyre age while keeping the surrounding racing context controlled.

The resulting curve represents the model's estimated change in pace as the tyre ages.

The curves are not forced to be linear. Tree-based models can learn nonlinear relationships between tyre age and lap performance, so the displayed curve represents the model's learned response rather than an artificially imposed straight line.

---

## 🖥️ Dashboard

The TrackShift frontend provides a motorsport-inspired race-control interface for exploring the model results.

The dashboard includes:

- Tyre degradation rates
- Relative durability ranking
- Pace-loss vs tyre-age visualization
- Compound comparison
- Model-derived degradation insights
- Validation information
- Methodology explanation

The interface is designed to make complex machine-learning results easier to interpret from a motorsport strategy perspective.

---

## 🏗️ Project Structure

```text
TrackShift-Final/
│
├── frontend/
│   └── Trackshift/
│       ├── src/
│       │   ├── screens/
│       │   ├── services/
│       │   └── ...
│       ├── package.json
│       └── ...
│
├── ml/
│   ├── trained models
│   ├── degradation curves
│   ├── degradation rates
│   └── model configuration
│
├── tyre_degradation_model_VSCode.py
│
├── api_server.py
│
├── ENRICHED_TYRE_DATASET_2022_ONWARDS.csv
│
└── README.md
```

---

## ⚙️ Tech Stack

### Machine Learning

- Python
- Pandas
- NumPy
- Scikit-learn
- SciPy
- LightGBM
- XGBoost
- CatBoost
- SHAP

### Frontend

- React
- TypeScript
- Vite
- CSS
- Data visualization

### Backend

- Python
- API-based model and data serving

---

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/dhairyamittal28106-alt/TRACKSHIFT-AI-MOTORSPORTS-INTELLIGENCE
cd TrackShift-Final
```

### 2. Install Python dependencies

```bash
pip install numpy pandas matplotlib scikit-learn scipy lightgbm xgboost catboost shap
```

### 3. Run the ML pipeline

```bash
python tyre_degradation_model_VSCode.py
```

The pipeline performs:

```text
Data Loading
     ↓
Data Cleaning
     ↓
Leakage Audit
     ↓
Feature Engineering
     ↓
GroupKFold Validation
     ↓
Model Training
     ↓
Ensemble Prediction
     ↓
Final Production Models
     ↓
Controlled Tyre Degradation
```

### 4. Run the backend

```bash
python api_server.py
```

### 5. Run the frontend

```bash
cd frontend/Trackshift
npm install
npm run dev
```

Open the local URL provided by Vite.

---

## 📁 Important Outputs

The ML pipeline generates controlled degradation results including:

```text
NEW_CONTROLLED_ML_DEGRADATION_RATES.csv
NEW_CONTROLLED_ML_DEGRADATION_CURVES.csv
```

### `NEW_CONTROLLED_ML_DEGRADATION_RATES.csv`

Contains degradation-rate summaries for:

- Soft
- Medium
- Hard

### `NEW_CONTROLLED_ML_DEGRADATION_CURVES.csv`

Contains the model-derived degradation curves for:

- LightGBM
- XGBoost
- CatBoost
- Ensemble

---

## 🔮 Future Scope

TrackShift can be extended with:

- 🏁 Race-session validation
- 🔮 Remaining tyre-life prediction
- ⛽ Fuel-load estimation
- 🧠 Real-time strategy recommendations
- 🔄 Pit-stop window prediction
- 🌡️ Tyre thermal-state modelling
- 📡 Live telemetry integration
- 📊 Prediction uncertainty estimation
- 🏆 Multi-race strategy comparison

A major next step is validating predicted tyre degradation against **actual race-session data** and using the resulting intelligence for real-time strategy recommendations.

---

## ⚠️ Limitations

The degradation values produced by TrackShift are **model-estimated pace-loss effects** and should not be interpreted as direct physical measurements of tyre wear.

The model can also capture patterns present in the available training data. Therefore, controlled ML curves should be interpreted alongside observed racing behaviour and further validation data.

Formal practice-to-race validation requires an appropriate race-session dataset.

---

## 👥 Team

### Team: Need For Speed

Built for the **HackCulture TrackShift Innovation Challenge 2026 — AI Motorsport Intelligence**.

---

## 🏁 Vision

TrackShift goes beyond simply asking:

> **"How fast was the lap?"**

and focuses on:

> **"Why did the lap slow down, how much of that can be attributed to the tyre, and what does it mean for the next strategic decision?"**

**TrackShift turns raw motorsport data into tyre-performance intelligence.**

---

## 📜 License

This project was developed as part of the **HackCulture TrackShift Innovation Challenge 2026**.

