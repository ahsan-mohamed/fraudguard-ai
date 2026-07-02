# 🛡️ FraudGuard AI — Fraud Detection & Explainability Platform

> An end-to-end AI-powered fraud detection system combining XGBoost machine learning with LLM-generated analyst explanations.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![XGBoost](https://img.shields.io/badge/XGBoost-ML-orange)
![Flask](https://img.shields.io/badge/Flask-REST%20API-lightgrey)
![React](https://img.shields.io/badge/React-Frontend-61dafb)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-purple)

---

## 🔍 What is FraudGuard AI?

FraudGuard AI is a production-grade fraud detection platform that:
- **Detects** fraudulent credit card transactions using a trained XGBoost model (ROC-AUC: 0.9745)
- **Explains** every prediction in plain English using Groq's LLaMA 3.3 70B model
- **Visualizes** top contributing features with interactive charts
- **Presents** results through a professional React dashboard with login authentication

---

## 🏗️ System Architecture
Credit Card Transaction
↓
Flask REST API
↓
XGBoost ML Model → Fraud Probability + Feature Importance
↓
Groq LLaMA 3.3 70B → Professional Analyst Explanation
↓
React Dashboard → Visual Results + Risk Badge

---

## ✨ Features

- 🔐 **Login System** — Role-based access (Analyst / Admin)
- 📊 **Live Stats Dashboard** — Total analyzed, fraud count, normal count
- 🤖 **ML Prediction** — XGBoost trained on 284,807 real transactions
- 💬 **LLM Explanation** — Plain English analyst-level explanation per transaction
- 📈 **Feature Importance Chart** — Top 5 contributing PCA components visualized
- 🎯 **Risk Badge** — HIGH / MEDIUM / LOW risk classification
- 🔄 **Sample Detection** — One-click real fraud + normal transaction demo
- ✍️ **Custom Input** — Enter any transaction (Amount, Time, V1-V28) for analysis

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| ML Model | XGBoost + SMOTE (imbalanced data handling) |
| LLM | Groq API — LLaMA 3.3 70B Versatile |
| Backend | Python, Flask, Flask-CORS |
| Frontend | React, Vite, Recharts, Lucide Icons |
| Data | Kaggle Credit Card Fraud Detection Dataset |
| Preprocessing | Scikit-learn StandardScaler, Pandas |

---

## 📊 Model Performance

| Metric | Score |
|---|---|
| ROC-AUC | 0.9745 |
| Fraud Recall | 88% |
| Overall Accuracy | 100% |
| Training Samples | 284,807 transactions |
| Fraud Cases | 492 (0.17% — highly imbalanced) |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repo
```bash
git clone https://github.com/ahsan-mohamed/fraudguard-ai.git
cd fraudguard-ai
```

### 2. Backend setup
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment variables
Create a `.env` file in the project root:
GROQ_API_KEY=your_groq_api_key_here

### 4. Train the model
```bash
python notebooks/02_model_training.py
```

### 5. Start the backend
```bash
cd backend
python app.py
```

### 6. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

### 7. Open in browser
http://localhost:5173

**Demo credentials:**
- `analyst` / `fraud123`
- `admin` / `admin123`

---

## 📁 Project Structure
fraudguard-ai/
├── data/                    # Dataset (not included — download from Kaggle)
├── models/                  # Saved ML model + scalers
├── notebooks/
│   ├── 01_eda.py            # Exploratory Data Analysis
│   ├── 02_model_training.py # XGBoost training with SMOTE
│   └── 03_test_explainer.py # LLM explainer test
├── backend/
│   └── app.py               # Flask REST API
├── frontend/
│   └── src/
│       ├── App.jsx          # Main dashboard
│       ├── Login.jsx        # Login page
│       └── Navbar.jsx       # Navigation bar
├── .env                     # API keys (not committed)
├── .gitignore
└── README.md

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | API health check |
| GET | `/predict/sample` | Run fraud + normal sample predictions |
| POST | `/predict` | Predict custom transaction |

### POST /predict — Request Body
```json
{
  "amount": 1.00,
  "time": 406,
  "V1": -2.3122,
  "V2": 1.9519,
  "...": "...",
  "V28": -0.1432
}
```

---

## 🎓 Dataset

This project uses the [Kaggle Credit Card Fraud Detection Dataset](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud):
- 284,807 transactions over 2 days
- 492 fraudulent transactions (0.17%)
- V1-V28 are PCA components (anonymized for privacy)
- Features: Time, Amount, Class

---

## 👨‍💻 Author

**Ahsan Mohamed**
- GitHub: [@ahsan-mohamed](https://github.com/ahsan-mohamed)
- LinkedIn: [https://www.linkedin.com/in/ahsan-mohamed-17515a2a5/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BgVZZQTs0SdanafZq4ZJO6Q%3D%3D)

---

## 📄 License

MIT License — feel free to use this project for learning and portfolio purposes.
