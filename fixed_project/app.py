"""
app.py - Flask backend for House Price Prediction System
         Uses real Kaggle India House Price dataset
"""

from flask import Flask, render_template, request
import pickle
import pandas as pd
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'house_model.pkl')

def load_model():
    print("Loading ML model... (this may take a moment)")
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. Please run: python model.py"
        )
    with open(MODEL_PATH, 'rb') as f:
        return pickle.load(f)

model_data = load_model()
model   = model_data['model']
metrics = model_data['metrics']


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    try:
        area       = float(request.form['area'])
        bedrooms   = int(request.form['bedrooms'])
        bathrooms  = int(request.form['bathrooms'])
        prop_age   = int(request.form.get('property_age', 10))
        schools    = int(request.form.get('schools', 2))
        renovated  = 0

        # Validations
        if area <= 0:
            raise ValueError("Living area must be greater than 0.")
        if bedrooms < 1 or bedrooms > 10:
            raise ValueError("Bedrooms must be between 1 and 10.")
        if bathrooms < 1 or bathrooms > bedrooms + 2:
            raise ValueError("Invalid number of bathrooms.")

        features = pd.DataFrame([[
            area, bedrooms, bathrooms, prop_age,
            renovated, schools
        ]], columns=model_data['features'])

        predicted_price = model.predict(features)[0]
        lower = predicted_price * 0.92
        upper = predicted_price * 1.08
        price_per_sqft = predicted_price / area
        price_lakhs = predicted_price / 100000
        lower_lakhs = lower / 100000
        upper_lakhs = upper / 100000

        return render_template(
            'result.html',
            price          = f"{predicted_price:,.0f}",
            price_raw      = int(predicted_price),
            price_lakhs    = f"{price_lakhs:.2f}",
            lower          = f"{lower:,.0f}",
            upper          = f"{upper:,.0f}",
            lower_lakhs    = f"{lower_lakhs:.2f}",
            upper_lakhs    = f"{upper_lakhs:.2f}",
            price_per_sqft = f"{price_per_sqft:,.0f}",
            area           = f"{area:,.0f}",
            bedrooms       = bedrooms,
            bathrooms      = bathrooms,
            property_age   = prop_age,
            schools        = schools,
            r2             = f"{metrics['r2'] * 100:.1f}",
            mae            = f"{metrics['mae']:,.0f}"
        )

    except ValueError as ve:
        return render_template('index.html', error=str(ve))
    except Exception as e:
        return render_template('index.html', error=f"Prediction failed: {str(e)}")


if __name__ == '__main__':
    print("\n🏠 House Price Prediction System — Real Dataset")
    print("━" * 45)
    print(f"   Model R²  : {metrics['r2']*100:.1f}%")
    print(f"   Model MAE : ₹{metrics['mae']:,.0f}")
    print(f"   Records   : 14,620 (Kaggle)")
    print("━" * 45)
    print("   Running at → http://127.0.0.1:5000\n")
    app.run(debug=True)
