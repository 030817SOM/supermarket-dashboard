# Supermarket Sales Prediction

An interactive, browser-based machine learning application that predicts supermarket sales from historical transaction data. Built with React, TypeScript, and a custom-implemented Linear Regression engine — no backend, no Python runtime, no data ever leaves the user's machine.

> **Live Demo:** Upload your `supermarket_transactions.xlsx` file and explore the full ML pipeline — data cleaning, exploratory analysis, model training, evaluation, and live prediction — entirely in your browser.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Dataset Schema](#dataset-schema)
- [Machine Learning Pipeline](#machine-learning-pipeline)
- [Model Performance Metrics](#model-performance-metrics)
- [Architecture Notes](#architecture-notes)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Overview

This project demonstrates a complete end-to-end machine learning workflow applied to supermarket transaction data, reimagined as a fully client-side web application. It mirrors a traditional Python/scikit-learn pipeline (pandas → matplotlib/seaborn → scikit-learn) but executes natively in the browser through a custom TypeScript implementation.

The application enables business users, data analysts, and learners to:

- Upload raw transactional spreadsheets
- Inspect automated data cleaning reports
- Visualize sales patterns and feature correlations
- Train a regression model in real time
- Generate live predictions through an interactive form

## Key Features

- **Zero-Setup Workflow** — Drag and drop an Excel file; the pipeline runs instantly in the browser.
- **Automated Data Cleaning** — Removes unnamed columns, missing values, and duplicate transactions with a transparent audit report.
- **Exploratory Data Analysis (EDA)** — Top products, sales-by-store breakdowns, payment-method distribution, and a feature correlation heatmap.
- **Custom ML Engine** — Linear Regression solved via the normal equation with Ridge regularization (λ = 1e-6), implemented from scratch in TypeScript.
- **Comprehensive Evaluation** — MAE, MSE, R², and Pearson correlation, paired with an Actual vs. Predicted scatter plot.
- **Live Prediction Form** — Inputs are label-encoded against the trained vocabulary and scored in real time.
- **Privacy-First** — All computation happens client-side. Uploaded data never leaves the device.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Charts | Recharts |
| Spreadsheet Parsing | SheetJS (`xlsx`) |
| ML Engine | Custom TypeScript implementation |
| Testing | Vitest |

## Project Structure

```
src/
├── components/
│   ├── EDAPanel.tsx          # Exploratory data analysis visualizations
│   ├── FileUpload.tsx        # Drag-and-drop spreadsheet uploader
│   ├── ModelPanel.tsx        # Model metrics + live prediction form
│   ├── SectionCard.tsx       # Reusable section container
│   └── StatCard.tsx          # KPI/metric display card
├── lib/
│   ├── dataPipeline.ts       # Parsing, cleaning, encoding pipeline
│   └── ml.ts                 # Linear Regression + metrics implementation
├── pages/
│   └── Index.tsx             # Main orchestrator: upload → train → predict
└── index.css                 # Design tokens and theme
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

## Usage Guide

1. **Launch** the application in your browser.
2. **Upload** an `.xlsx` file containing supermarket transaction records (see [Dataset Schema](#dataset-schema)).
3. **Review** the cleaning report — raw rows, removed unnamed columns, dropped missing values, deduplicated rows, and final usable dataset size.
4. **Explore** the EDA panel for visual insights into product, store, and payment trends.
5. **Inspect** the model panel for performance metrics and the Actual vs. Predicted plot.
6. **Predict** sales by entering quantity, product, store, payment method, customer type, and unit price into the live form.

## Dataset Schema

The uploaded spreadsheet must include the following columns:

| Column | Type | Description |
|--------|------|-------------|
| `quantity` | Numeric | Number of units sold |
| `product_name` | Categorical | Product identifier or name |
| `unit_price` | Numeric | Price per unit |
| `store` | Categorical | Store branch or location |
| `payment_method` | Categorical | Cash, card, mobile wallet, etc. |
| `customer_type` | Categorical | Member, guest, or other segment |
| `total_amount` | Numeric | **Target variable** — total sale value |

## Machine Learning Pipeline

The pipeline mirrors a standard scikit-learn workflow:

1. **Load** — Parse the workbook with SheetJS.
2. **Clean** — Drop unnamed columns, missing values, and exact duplicates.
3. **Encode** — Apply label encoding to categorical features and preserve inverse mappings for live prediction.
4. **Split** — Partition the dataset into training and test subsets.
5. **Train** — Fit a Linear Regression model using the normal equation `(XᵀX + λI)⁻¹ Xᵀy` with Ridge regularization for numerical stability.
6. **Evaluate** — Compute MAE, MSE, R², and Pearson correlation on the test set.
7. **Predict** — Score new inputs through the trained weights and decoded categorical mappings.

## Model Performance Metrics

| Metric | Description |
|--------|-------------|
| **MAE** | Mean Absolute Error — average magnitude of prediction error |
| **MSE** | Mean Squared Error — penalizes larger errors more heavily |
| **R²** | Coefficient of Determination — proportion of variance explained |
| **Pearson r** | Linear correlation between actual and predicted values |

## Architecture Notes

- **Client-Side Only** — There is no server, database, or API. All processing happens in the browser.
- **Deterministic Pipeline** — Cleaning, encoding, and training are pure functions, making the pipeline easy to test and reason about.
- **Numerical Stability** — Ridge regularization prevents singular-matrix failures on collinear or sparse feature sets.
- **Type Safety** — Shared TypeScript types flow from the data pipeline through the ML engine to the UI components.

## Future Improvements

- Time-series sales forecasting (ARIMA, Prophet-style models)
- Customer segmentation via clustering
- Product recommendation engine
- Tree-based or deep learning models for nonlinear patterns
- Interactive dashboard filters (date range, store, category)
- Real-time streaming analytics integration

## License

This project is licensed under the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Software,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

---

## Author

Wanga Somhlaba  
Machine Learning • React • TypeScript • Data Analytics 
