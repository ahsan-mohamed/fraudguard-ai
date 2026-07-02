import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (classification_report, confusion_matrix, 
                             roc_auc_score, roc_curve)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os

# Load data
df = pd.read_csv('/Users/ahsanmohamed/fraud-detection-explainer/creditcard.csv')
print("Dataset Loaded!")
print(f"Shape: {df.shape}")

# ── Feature Engineering ────────────────────────────────────
# Scale Amount and Time (V1-V28 are already scaled by the bank)
scaler = StandardScaler()
df['Amount_scaled'] = scaler.fit_transform(df[['Amount']])
df['time_scaled'] = scaler.fit_transform(df[['Time']])
df.drop(['Amount','Time'],axis=1,inplace=True)

# ── Split Features & Target ────────────────────────────────
X = df.drop('Class', axis=1)
y =df['Class']

X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2,random_state=42,stratify=y)
print(f"Train size: {X_train.shape}, Test size: {X_test.shape}")

# ── Handle Class Imbalance with SMOTE ─────────────────────
print("\nApplying SMOTE to balance classes...")
smote = SMOTE(random_state=42)
X_train_sm, y_train_sm = smote.fit_resample(X_train, y_train)
print(f"After SMOTE - Class distribution:\n{pd.Series(y_train_sm).value_counts()}")

# ── Train XGBoost Model ────────────────────────────────────
print("\nTraining XGBoost model...")
model = XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    scale_pos_weight=1,  # balanced after SMOTE
    use_label_encoder=False,
    eval_metric='logloss',
    random_state=42
)
model.fit(X_train_sm, y_train_sm)
print("Training complete!")

# ── Evaluate ───────────────────────────────────────────────
y_pred  = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

print("\n--- Classification Report ---")
print(classification_report(y_test, y_pred, target_names=['Normal', 'Fraud']))

roc_auc = roc_auc_score(y_test, y_proba)
print(f"ROC-AUC Score: {roc_auc:.4f}")

# ── Confusion Matrix ───────────────────────────────────────
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(6,4))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Normal','Fraud'],
            yticklabels=['Normal','Fraud'])
plt.title('Confusion Matrix')
plt.ylabel('Actual')
plt.xlabel('Predicted')
plt.tight_layout()
plt.savefig('/Users/ahsanmohamed/fraud-detection-explainer/models/confusion_matrix.png')
plt.show()

# ── ROC Curve ──────────────────────────────────────────────
fpr, tpr, _ = roc_curve(y_test, y_proba)
plt.figure(figsize=(7,5))
plt.plot(fpr, tpr, label=f'XGBoost (AUC = {roc_auc:.4f})', color='darkorange')
plt.plot([0,1],[0,1], 'k--')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve')
plt.legend()
plt.tight_layout()
plt.savefig('/Users/ahsanmohamed/fraud-detection-explainer/models/roc_curve.png')
plt.show()

# ── Feature Importance ─────────────────────────────────────
feat_imp = pd.Series(model.feature_importances_, index=X.columns)
feat_imp = feat_imp.sort_values(ascending=False).head(15)

plt.figure(figsize=(8,5))
feat_imp.plot(kind='bar', color='steelblue')
plt.title('Top 15 Feature Importances')
plt.ylabel('Importance Score')
plt.tight_layout()
plt.savefig('/Users/ahsanmohamed/fraud-detection-explainer/models/feature_importance.png')
plt.show()

# ── Save Model & Scaler ────────────────────────────────────
os.makedirs('/Users/ahsanmohamed/fraud-detection-explainer/models', exist_ok=True)
joblib.dump(model,  '/Users/ahsanmohamed/fraud-detection-explainer/models/xgboost_fraud_model.pkl')
joblib.dump(scaler, '/Users/ahsanmohamed/fraud-detection-explainer/models/scaler.pkl')
joblib.dump(list(X.columns), '/Users/ahsanmohamed/fraud-detection-explainer/models/feature_names.pkl')
print("\nModel and scaler saved to /models!")