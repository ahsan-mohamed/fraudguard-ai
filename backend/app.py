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
CORS(app, origins=[
    "http://localhost:5173",
    "https://fraudguard-ai-lovat.vercel.app"
])

model         = joblib.load(os.path.join(BASE_DIR, 'models', 'xgboost_fraud_model.pkl'))
feature_names = joblib.load(os.path.join(BASE_DIR, 'models', 'feature_names.pkl'))
scaler_amount = joblib.load(os.path.join(BASE_DIR, 'models', 'scaler_amount.pkl'))
scaler_time   = joblib.load(os.path.join(BASE_DIR, 'models', 'scaler_time.pkl'))

print("✅ Feature count:", len(feature_names))

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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

def get_top_features(X_input):
    feature_imp  = pd.Series(model.feature_importances_, index=feature_names)
    top_features = feature_imp.nlargest(5)
    summary = "\n".join([
        f"- {feat}: value={X_input[feat].values[0]:.4f}, importance={imp:.4f}"
        for feat, imp in top_features.items()
    ])
    return top_features, summary

# ── Hardcoded sample rows (so CSV not needed on server) ───
FRAUD_SAMPLE = {
    'amount': 0.0, 'time': 406.0,
    'V1': -2.3122265423263, 'V2': 1.95199201064158, 'V3': -1.60985073229769,
    'V4': 3.9979055875468, 'V5': -0.522187864667764, 'V6': -1.42654531920595,
    'V7': -2.53738730624579, 'V8': 1.39165724829804, 'V9': -2.77008927719433,
    'V10': -2.77227214465915, 'V11': 3.20203320709635, 'V12': -2.89990738849473,
    'V13': -0.595221881324605, 'V14': -4.28925378244217, 'V15': 0.389724120274487,
    'V16': -1.14074717980657, 'V17': -2.83005567450437, 'V18': -0.0168224681808257,
    'V19': 0.416955705037907, 'V20': 0.126910559061474, 'V21': 0.517232370861764,
    'V22': -0.0350493686052974, 'V23': -0.465211076182388, 'V24': 0.320198198514526,
    'V25': 0.0445191674731724, 'V26': 0.177839798284401, 'V27': 0.261145002567677,
    'V28': -0.143275874698919
}

NORMAL_SAMPLE = {
    'amount': 149.62, 'time': 0.0,
    'V1': -1.3598071336738, 'V2': -0.0727811733098497, 'V3': 2.53634673796914,
    'V4': 1.37815522427443, 'V5': -0.338320769942518, 'V6': 0.462387777762292,
    'V7': 0.239598554061257, 'V8': 0.0986979012610507, 'V9': 0.363786969611213,
    'V10': 0.0907941719789316, 'V11': -0.551599533260813, 'V12': -0.617800855762348,
    'V13': -0.991389847235408, 'V14': -0.311169353699879, 'V15': 1.46817697209427,
    'V16': -0.470400525259478, 'V17': 0.207971241929242, 'V18': 0.0257905801985591,
    'V19': 0.403992960255733, 'V20': 0.251412098239705, 'V21': -0.018306777944153,
    'V22': 0.277837575558899, 'V23': -0.110473910188767, 'V24': 0.0669280749146731,
    'V25': 0.128539358273528, 'V26': -0.189114843888824, 'V27': 0.133558376740387,
    'V28': -0.0210530534538215
}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "Fraud Detection API is running!"})

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

@app.route('/predict/sample', methods=['GET'])
def predict_sample():
    try:
        results = []
        for row, label in [(FRAUD_SAMPLE, 'fraud'), (NORMAL_SAMPLE, 'normal')]:
            X_input    = build_input(row)
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
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)