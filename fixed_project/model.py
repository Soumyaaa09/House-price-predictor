"""
model.py - Train House Price Prediction model on real dataset
         Source: Kaggle - India House Price Prediction (14,620 records)
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import pickle
import os, shutil

# ─── Load Real Dataset ────────────────────────────────────────────────────────
CSV_PATH = os.path.join(os.path.dirname(__file__), 'dataset', 'House_Price_India.csv')
if not os.path.exists(CSV_PATH):
    raise FileNotFoundError(
        f"Dataset not found at '{CSV_PATH}'.\n"
        "Please copy House_Price_India.csv into the dataset/ folder."
    )

df = pd.read_csv(CSV_PATH)
print(f"✅ Dataset loaded: {len(df):,} records, {df.shape[1]} columns\n")

# ─── Feature Engineering ──────────────────────────────────────────────────────
# Derive property age from Built Year
df['property_age'] = 2024 - df['Built Year']

# Was the house renovated?
df['renovated'] = (df['Renovation Year'] > 0).astype(int)

# Basement present
df['has_basement'] = (df['Area of the basement'] > 0).astype(int)

# Round bathrooms to nearest 0.5 → integer for simplicity
df['bathrooms_int'] = df['number of bathrooms'].apply(lambda x: max(1, round(x)))

# Cap bedrooms at 10
df['bedrooms'] = df['number of bedrooms'].clip(1, 10)

# ─── Select Features ──────────────────────────────────────────────────────────
features = [
    'living area',             # sq ft
    'bedrooms',                # 1–10
    'bathrooms_int',           # 1–8
    'property_age',            # years
    'renovated',               # 0/1
    'Number of schools nearby' # 1–3
]

X = df[features]
y = df['Price']

# ─── Train / Test Split ───────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ─── Train Model ──────────────────────────────────────────────────────────────
print("🔄 Training Random Forest...")
model = RandomForestRegressor(
    n_estimators=200,
    max_depth=None,
    min_samples_split=2,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

# ─── Evaluate ─────────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)
r2   = r2_score(y_test, y_pred)
mae  = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))

print("📊 Model Evaluation:")
print(f"   R² Score : {r2:.4f}")
print(f"   MAE      : ₹{mae:,.0f}")
print(f"   RMSE     : ₹{rmse:,.0f}\n")

# ─── Save ─────────────────────────────────────────────────────────────────────
model_data = {
    'model':    model,
    'features': features,
    'metrics':  {'r2': r2, 'mae': mae, 'rmse': rmse},
    'price_min': int(y.min()),
    'price_max': int(y.max()),
    'price_mean': int(y.mean()),
}

with open('house_model.pkl', 'wb') as f:
    pickle.dump(model_data, f)

print("✅ Model saved as house_model.pkl")
print("🚀 Ready to run app.py!")
