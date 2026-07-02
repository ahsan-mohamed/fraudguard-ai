import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from groq import Groq
from dotenv import load_dotenv
import os
load_dotenv('/Users/ahsanmohamed/fraud-detection-explainer/.env')

# ── Load model & artifacts ─────────────────────────────────
model         = joblib.load('/Users/ahsanmohamed/fraud-detection-explainer/models/xgboost_fraud_model.pkl')
scaler        = joblib.load('/Users/ahsanmohamed/fraud-detection-explainer/models/scaler.pkl')
feature_names = joblib.load('/Users/ahsanmohamed/fraud-detection-explainer/models/feature_names.pkl')

# ── Pick a real fraud transaction from dataset ─────────────
df = pd.read_csv('/Users/ahsanmohamed/fraud-detection-explainer/creditcard.csv')
fraud_sample = df[df['Class'] == 1].iloc[0].copy()

# ── Preprocess same way as training ───────────────────────
fraud_sample['Amount_scaled'] = scaler.transform([[fraud_sample['Amount']]])[0][0]
fraud_sample['Time_scaled']   = fraud_sample['Time']  # rough scale for test
fraud_sample.drop(['Amount', 'Time', 'Class'], inplace=True)

X_input = pd.DataFrame([fraud_sample], columns=feature_names)

# ── Get prediction & confidence ───────────────────────────
prediction = model.predict(X_input)[0]
confidence = model.predict_proba(X_input)[0][1] * 100

print(f"Prediction: {'FRAUD' if prediction == 1 else 'NORMAL'}")
print(f"Fraud Confidence: {confidence:.2f}%")

# ── Get top contributing features ─────────────────────────
importances   = model.feature_importances_
feature_imp   = pd.Series(importances, index=feature_names)
top_features  = feature_imp.nlargest(5)

feature_summary = "\n".join([
    f"- {feat}: value={X_input[feat].values[0]:.4f}, importance={imp:.4f}"
    for feat, imp in top_features.items()
])

# ── LLM Explanation ───────────────────────────────────────
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

prompt = f"""You are a fraud analyst AI assistant. A machine learning model has flagged a financial transaction.

Prediction: {'FRAUD' if prediction == 1 else 'NORMAL'}
Fraud Confidence: {confidence:.2f}%

Top contributing features that influenced this decision:
{feature_summary}

Note: V1-V28 are anonymized PCA components from the original transaction data for privacy reasons.

Write a clear, professional explanation (3-4 sentences) for a bank analyst explaining:
1. Whether this transaction is suspicious
2. Which patterns triggered the alert
3. What action should be recommended
"""

response = client.chat.completions.create(
   model="llama-3.3-70b-versatile", # free model
    messages=[{"role": "user", "content": prompt}],
    max_tokens=300
)

print("\n--- LLM Explanation ---")
print(response.choices[0].message.content)