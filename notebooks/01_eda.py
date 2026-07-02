import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Load data
df = pd.read_csv('/Users/ahsanmohamed/fraud-detection-explainer/creditcard.csv')
print("Dataset Loaded!")
print(f"Shape: {df.shape}")

#Basic Overview
print(df.head())
print("\n-- Info --")
print(df.info())
print("\n-- Missing Values --")
print(df.isnull().sum())
print("\n-- Class Distribution --")
print(df['Class'].value_counts())
print(f"\nFraud %: {df['Class'].mean() * 100:.4f}%")

#Class Imbalance
plt.figure(figsize=(6,4))
sns.countplot(x='Class', data=df)
plt.title('Class Distribution (0=Normal ,1=Fraud)')
plt.xticks([0,1],['normal','Fraud'])
plt.show()

# Transaction Amount Analysis
fig, axes = plt.subplots(1, 2, figsize=(14,4))
axes[0].hist(df[df['Class']==0]['Amount'], bins=50, color='blue', alpha=0.6)
axes[0].set_title('Normal Transaction Amounts')
axes[0].set_xlabel('Amount')
axes[1].hist(df[df['Class']==1]['Amount'], bins=50, color='red', alpha=0.6)
axes[1].set_title('Fraud Transaction Amounts')
axes[1].set_xlabel('Amount')
plt.tight_layout()
plt.show()

print(f"Normal avg amount: ${df[df['Class']==0]['Amount'].mean():.2f}")
print(f"Fraud avg amount:  ${df[df['Class']==1]['Amount'].mean():.2f}")


# Correlation Heatmap
plt.figure(figsize=(20,10))
corr = df.corr()
sns.heatmap(corr ,cmap='coolwarm', center=0, linewidths=0.5)
plt.title('feature Correlation Heatmap')
plt.show()

# Top Features
fraud_corr = corr['Class'].drop('Class').abs().sort_values(ascending=False)
print("Top 10 features most correlated with fraud:")
print(fraud_corr.head(10))

plt.figure(figsize=(8,5))
fraud_corr.head(10).plot(kind='bar', color='coral')
plt.title('Top 10 Features Correlated with Fraud')
plt.ylabel('Absolute Correlation')
plt.tight_layout()
plt.show()

# Time Analysis
plt.figure(figsize=(12,4))
plt.plot(df[df['Class']==0]['Time'], df[df['Class']==0]['Amount'],
         '.', alpha=0.1, label='Normal', color='blue')
plt.plot(df[df['Class']==1]['Time'], df[df['Class']==1]['Amount'],
         '.', alpha=0.5, label='Fraud', color='red')
plt.xlabel('Time (seconds)')
plt.ylabel('Amount')
plt.title('Transactions Over Time')
plt.legend()
plt.show()