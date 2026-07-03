from time import time

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from groq import Groq
from dotenv import load_dotenv
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


load_dotenv(os.path.join(BASE_DIR, '.env'))

app = Flask(__name__)
CORS(app)

# ── Load Model Artifacts ───────────────────────────────────
model         = joblib.load(os.path.join(BASE_DIR, 'models', 'xgboost_fraud_model.pkl'))
print("✅ Model loaded from:", os.path.join(BASE_DIR, 'models', 'xgboost_fraud_model.pkl'))
print("✅ Model n_estimators:", model.n_estimators)
print("✅ Model classes:", model.classes_)
feature_names = joblib.load(os.path.join(BASE_DIR, 'models', 'feature_names.pkl'))
scaler_amount = joblib.load(os.path.join(BASE_DIR, 'models', 'scaler_amount.pkl'))
scaler_time   = joblib.load(os.path.join(BASE_DIR, 'models', 'scaler_time.pkl'))

print("✅ Feature names:", feature_names)
print("✅ Feature count:", len(feature_names))

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── Helper: Generate LLM Explanation ──────────────────────
def generate_explanation(prediction, confidence, feature_summary):
    prompt = f"""You are a fraud analyst AI assistant. A machine learning model has analyzed a financial transaction.

Prediction: {'FRAUD' if prediction == 1 else 'NORMAL'}
Fraud Confidence: {confidence:.2f}%

Top contributing features:
{feature_summary}

Note: V1-V28 are anonymized PCA components for privacy reasons.

Write a clear, professional explanation (3-4 sentences) for a bank analyst explaining:
1. Whether this transaction is suspicious
2. Which patterns triggered the alert
3. What action should be recommended
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300
    )
    return response.choices[0].message.content


# ── Helper: Build input DataFrame ─────────────────────────
def build_input(data):
    amount = float(data.get('amount', 0))
    time   = float(data.get('time', 0))

    amount_scaled = scaler_amount.transform([[amount]])[0][0]
    time_scaled   = scaler_time.transform([[time]])[0][0]

    feature_dict = {}
    for name in feature_names:
        if name == 'Amount_scaled':
            feature_dict[name] = amount_scaled
        elif name == 'time_scaled':
            feature_dict[name] = time_scaled
        elif name.startswith('V'):
            feature_dict[name] = float(data.get(name, 0))
        else:
            feature_dict[name] = 0.0

    return pd.DataFrame([feature_dict], columns=feature_names)


# ── Helper: Get top features summary ──────────────────────
def get_top_features(X_input):
    feature_imp  = pd.Series(model.feature_importances_, index=feature_names)
    top_features = feature_imp.nlargest(5)
    summary = "\n".join([
        f"- {feat}: value={X_input[feat].values[0]:.4f}, importance={imp:.4f}"
        for feat, imp in top_features.items()
    ])
    return top_features, summary


# ── Route: Health Check ────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "Fraud Detection API is running!"})


# ── Route: Predict ─────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data       = request.get_json()
        X_input    = build_input(data)
        prediction = int(model.predict(X_input)[0])
        confidence = float(model.predict_proba(X_input)[0][1]) * 100

        top_features, feature_summary = get_top_features(X_input)
        explanation = generate_explanation(prediction, confidence, feature_summary)

        return jsonify({
            "prediction"  : "FRAUD" if prediction == 1 else "NORMAL",
            "confidence"  : round(confidence, 2),
            "explanation" : explanation,
            "top_features": top_features.to_dict()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Route: Sample Predict ──────────────────────────────────
@app.route('/predict/sample', methods=['GET'])
def predict_sample():
    try:
        df = pd.read_csv(os.path.join(BASE_DIR, 'data', 'creditcard.csv'))

        fraud_row  = df[df['Class'] == 1].iloc[0]
        normal_row = df[df['Class'] == 0].iloc[0]

        results = []
        for row, label in [(fraud_row, 'fraud'), (normal_row, 'normal')]:
            data = {'amount': row['Amount'], 'time': row['Time']}
            for i in range(1, 29):
                data[f'V{i}'] = row[f'V{i}']

            X_input    = build_input(data)
            prediction = int(model.predict(X_input)[0])
            confidence = float(model.predict_proba(X_input)[0][1]) * 100

            top_features, feature_summary = get_top_features(X_input)
            explanation = generate_explanation(prediction, confidence, feature_summary)

            results.append({
                "sample_type" : label,
                "prediction"  : "FRAUD" if prediction == 1 else "NORMAL",
                "confidence"  : round(confidence, 2),
                "explanation" : explanation,
                "top_features": top_features.to_dict()
            })

        return jsonify({"results": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)