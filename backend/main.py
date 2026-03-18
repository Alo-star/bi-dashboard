from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import pandas as pd
import sqlite3, json, traceback, io, os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ── Database setup ───────────────────────────────────────────────
DB_PATH = "sales.db"
UPLOAD_FOLDER = "uploaded_files"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
conn = sqlite3.connect(DB_PATH, check_same_thread=False)

# ── Global state ─────────────────────────────────────────────────
current_columns = []
current_filename = ""

def load_dataframe(df: pd.DataFrame):
    global current_columns
    df.columns = [c.strip().lower().replace(" ", "_").replace(".", "") for c in df.columns]
    df = df.fillna(0)
    df.to_sql("sales", conn, if_exists="replace", index=False)
    current_columns = list(df.columns)
    print("✅ Loaded columns:", current_columns)
    return current_columns

# ── Load default CSV on startup ──────────────────────────────────
DEFAULT_CSV = "amazon_sales.csv"
try:
    df_default = pd.read_csv(DEFAULT_CSV)
    load_dataframe(df_default)
    current_filename = DEFAULT_CSV
    print("✅ Default dataset ready!")
except Exception as e:
    print("⚠️ Default CSV not found:", e)

# ── OpenRouter client ────────────────────────────────────────────
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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"
)

# ── AI Prompt ────────────────────────────────────────────────────
SYSTEM_PROMPT = """
You are an expert data analyst and SQL engineer.
You have a SQLite table called 'sales' with these exact columns: {columns}
The user asked: "{question}"

STRICT RULES:
1. Write a valid SQLite SELECT query using ONLY the columns listed above.
2. Choose the most appropriate chart type:
   - bar  = comparisons between categories
   - line = trends over time (use when date/time column is involved)
   - pie  = percentages or proportions (max 8 slices only)
3. Always use aggregate functions like SUM(), COUNT(), AVG() when needed.
4. If the question is completely unrelated to the data, return:
   {{"error": "Sorry, I cannot answer this from the available data. Please ask about: {columns}"}}
5. Return ONLY a valid JSON object. No explanation. No markdown. No extra text.

JSON format to return:
{{
  "sql": "SELECT column1, SUM(column2) FROM sales GROUP BY column1 ORDER BY SUM(column2) DESC",
  "chart_type": "bar",
  "x_axis": "column1",
  "y_axis": "column2",
  "title": "Clear descriptive title",
  "insight": "One sentence business insight from this data"
}}
"""

# ── Models ───────────────────────────────────────────────────────
class Query(BaseModel):
    question: str

# ── Routes ───────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "BI Dashboard API is running!"}

@app.get("/columns")
def get_columns():
    return {
        "columns": current_columns,
        "filename": current_filename,
        "total_rows": pd.read_sql_query(
            "SELECT COUNT(*) as count FROM sales", conn
        ).iloc[0]["count"] if current_columns else 0
    }

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    global current_columns, current_filename
    if not file.filename.endswith(".csv"):
        return {"error": "Only CSV files are allowed."}
    try:
        contents = await file.read()
        save_path = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(save_path, "wb") as f:
            f.write(contents)
        print(f"✅ File saved: {save_path}")
        try:
            df = pd.read_csv(io.BytesIO(contents), encoding="utf-8", on_bad_lines="skip")
        except Exception:
            df = pd.read_csv(io.BytesIO(contents), encoding="latin1", on_bad_lines="skip")
        if len(df) == 0:
            return {"error": "The uploaded file is empty."}
        if len(df.columns) < 2:
            return {"error": "CSV must have at least 2 columns."}
        cols = load_dataframe(df)
        current_filename = file.filename
        return {
            "success": True,
            "message": f"'{file.filename}' uploaded successfully!",
            "filename": file.filename,
            "rows": len(df),
            "columns": cols
        }
    except Exception as e:
        print("❌ Upload error:", traceback.format_exc())
        return {"error": f"Failed to process file: {str(e)}"}

@app.post("/ask")
async def ask(query: Query):
    global current_columns
    if not current_columns:
        return {"error": "No dataset loaded. Please upload a CSV file first."}
    if not query.question.strip():
        return {"error": "Please enter a question."}
    try:
        print("📨 Question:", query.question)
        prompt = SYSTEM_PROMPT.format(
            columns=current_columns,
            question=query.question.strip()
        )
        response = client.chat.completions.create(
            model="openrouter/auto",
            messages=[{"role": "user", "content": prompt}]
        )
        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        print("🤖 AI response:", raw)
        plan = json.loads(raw)
        if "error" in plan:
            return {"error": plan["error"]}
        required = ["sql", "chart_type", "x_axis", "y_axis", "title"]
        for field in required:
            if field not in plan:
                return {"error": f"AI response missing: {field}. Please rephrase."}
        result = pd.read_sql_query(plan["sql"], conn)
        result = result.fillna(0)
        print("✅ Rows returned:", len(result))
        if len(result) == 0:
            return {"error": "Query returned no data. Try a different question."}
        return {
            "success": True,
            "chart_type": plan.get("chart_type", "bar"),
            "title":      plan.get("title", "Result"),
            "insight":    plan.get("insight", ""),
            "x_axis":     plan.get("x_axis"),
            "y_axis":     plan.get("y_axis"),
            "sql":        plan.get("sql"),
            "data":       result.head(20).to_dict(orient="records")
        }
    except json.JSONDecodeError:
        return {"error": "AI returned unexpected format. Please rephrase your question."}
    except Exception as e:
        print("❌ ERROR:", traceback.format_exc())
        return {"error": f"Something went wrong: {str(e)}"}
