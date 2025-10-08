#!/usr/bin/env python3
import pandas as pd
import numpy as np
from datetime import datetime

# Load the dataset
df = pd.read_csv('traffic_accidents.csv', header=None)

print("Dataset Analysis")
print("="*50)
print(f"Dataset shape: {df.shape}")
print(f"Number of rows: {len(df)}")
print(f"Number of columns: {len(df.columns)}")

# Display first few rows
print("\nFirst 5 rows:")
print(df.head())

print("\nColumn data types:")
for i, col in enumerate(df.columns):
    print(f"Column {i}: {df[col].dtype}")
    
print("\nSample values from each column:")
for i in range(len(df.columns)):
    print(f"Column {i}: {df.iloc[0, i]}")
    
print("\nUnique values in key columns:")
# Check a few columns that might be categorical
for i in [1, 2, 3, 4, 9, 11, 13]:  # Traffic control, weather, lighting, etc.
    unique_vals = df[i].nunique()
    print(f"Column {i}: {unique_vals} unique values")
    if unique_vals < 20:
        print(f"  Values: {df[i].unique()[:10]}")

# Try to identify column meanings based on sample values
print("\nColumn identification based on sample values:")
sample_row = df.iloc[0]
for i, val in enumerate(sample_row):
    print(f"Column {i}: {val}")