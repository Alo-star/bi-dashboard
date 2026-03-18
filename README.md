# 📊 Datawrapper — Conversational BI Dashboard

> Transform plain English questions into beautiful, interactive business dashboards instantly using AI.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-green)
![Tech Stack](https://img.shields.io/badge/AI-OpenRouter%20LLM-orange)
![Tech Stack](https://img.shields.io/badge/Database-SQLite-lightgrey)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## 🚀 What is Datawrapper?

Datawrapper is an AI-powered Business Intelligence tool that allows **non-technical users** to generate fully functional, interactive data dashboards using only natural language prompts.

No SQL. No coding. Just ask.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 Natural Language Queries | Ask questions in plain English |
| 📊 Smart Chart Selection | AI picks the best chart type automatically |
| 📁 CSV Upload | Upload your own data and start querying instantly |
| 🌓 Dark / Light Mode | Toggle with the hamburger menu |
| 💡 AI Insights | One-line business insight below every chart |
| ⚡ Real-time Generation | Charts appear in seconds |
| 🛡️ Error Handling | Graceful handling of vague or invalid queries |

---

## 🛠️ Tech Stack
```
Frontend  →  React + Vite + Recharts
Backend   →  Python FastAPI
AI / LLM  →  OpenRouter API (LLM Gateway)
Database  →  SQLite (auto-generated from CSV)
Data      →  Amazon Sales CSV (50,000+ rows)
```

---

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/bi-dashboard.git
cd bi-dashboard
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the backend folder:
```
OPENROUTER_API_KEY=your_openrouter_key_here
```

Start the backend:
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`

---

## 💡 Example Queries

Try these in the dashboard:
```
1. Show total revenue by product category as a bar chart
2. Show monthly revenue trend over time as a line chart
3. Show revenue share by customer region as a pie chart
4. Show top 5 categories by average rating as a bar chart
5. Show orders by payment method as a pie chart
```

---

## 🏗️ Architecture
```
User Input (Natural Language)
        ↓
   React Frontend
        ↓
  FastAPI Backend
        ↓
  OpenRouter LLM API
        ↓
  SQL Query Generated
        ↓
  SQLite Database
        ↓
  Data Returned
        ↓
  Recharts Visualization
        ↓
  Interactive Dashboard
```

---

## 📁 Project Structure
```
bi-dashboard/
├── backend/
│   ├── main.py              # FastAPI server + AI logic
│   ├── amazon_sales.csv     # Default dataset
│   ├── requirements.txt     # Python dependencies
│   └── uploaded_files/      # User uploaded CSVs
├── frontend/
│   ├── src/
│   │   └── App.jsx          # Main React component
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Node dependencies
├── .gitignore
└── README.md
```

---

## 👥 Team

| Member | Role |
|---|---|
| Member 1 | Frontend & UI Design |
| Member 2 | Backend & AI Integration |

---

## 📄 License

MIT License — feel free to use and modify.